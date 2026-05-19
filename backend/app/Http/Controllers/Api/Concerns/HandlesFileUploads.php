<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Encoders\AutoEncoder;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\Encoders\WebpEncoder;

trait HandlesFileUploads
{
    /**
     * Store an uploaded file directly in public/storage/{folder}/
     * Returns the relative path e.g. "products/abc123.jpg"
     *
     * Automatically compresses images to under 500KB (except GIFs which are kept at original size)
     */
    protected function storePublicFile(UploadedFile $file, string $folder): string
    {
        try {
            $dir = public_path("storage/{$folder}");
            File::ensureDirectoryExists($dir);

            $extension = strtolower($file->getClientOriginalExtension());
            $filename = Str::random(40) . '.' . $extension;
            $fullPath = $dir . '/' . $filename;

            // Check if file is an image
            $imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];
            $isImage = in_array($extension, $imageExtensions);

            // GIFs and SVGs are uploaded at their actual size without compression
            if ($extension === 'gif' || $extension === 'svg') {
                $file->move($dir, $filename);
                return "{$folder}/{$filename}";
            }

            // For other images, compress if needed
            if ($isImage) {
                $this->processAndCompressImage($file, $fullPath, $extension);
            } else {
                // Non-image files are moved directly
                $file->move($dir, $filename);
            }

            return "{$folder}/{$filename}";
        } catch (\Exception $e) {
            \Log::error('File upload failed in storePublicFile', [
                'folder' => $folder,
                'original_name' => $file->getClientOriginalName(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Process and compress an image to under 500KB
     */
    protected function processAndCompressImage(UploadedFile $file, string $targetPath, string $extension): void
    {
        try {
            $maxSizeKB = 500;
            $maxSizeBytes = $maxSizeKB * 1024;

            // Load the image
            $image = Image::read($file->getPathname());

            // Start with quality 90
            $quality = 90;
            $tempPath = $targetPath . '.tmp';

            // Select the appropriate encoder based on extension
            $getEncoder = function($ext, $qual) {
                switch ($ext) {
                    case 'jpg':
                    case 'jpeg':
                        return new JpegEncoder($qual);
                    case 'png':
                        return new PngEncoder();
                    case 'webp':
                        return new WebpEncoder($qual);
                    default:
                        return new AutoEncoder($qual);
                }
            };

            // Try to save with decreasing quality until file size is acceptable
            do {
                // Encode the image with current quality
                $encoder = $getEncoder($extension, $quality);
                $encoded = $image->encode($encoder);
                file_put_contents($tempPath, $encoded);

                $fileSize = filesize($tempPath);

                // If file is small enough, we're done
                if ($fileSize <= $maxSizeBytes) {
                    rename($tempPath, $targetPath);
                    return;
                }

                // If quality is already very low and file is still too large, resize the image
                if ($quality <= 60) {
                    $currentWidth = $image->width();
                    $currentHeight = $image->height();

                    // Reduce dimensions by 10%
                    $newWidth = (int)($currentWidth * 0.9);
                    $newHeight = (int)($currentHeight * 0.9);

                    // Don't resize below 200px on the smallest dimension
                    if ($newWidth < 200 || $newHeight < 200) {
                        // File is too large even at minimum size, save what we have
                        rename($tempPath, $targetPath);
                        return;
                    }

                    $image->scale($newWidth, $newHeight);
                    $quality = 85; // Reset quality after resize
                } else {
                    // Decrease quality by 5
                    $quality -= 5;
                }

            } while ($quality >= 50);

            // If we exit the loop, save the last version
            if (file_exists($tempPath)) {
                rename($tempPath, $targetPath);
            }
        } catch (\Exception $e) {
            \Log::error('Image compression failed in processAndCompressImage', [
                'target_path' => $targetPath,
                'extension' => $extension,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Delete a file from public/storage/
     */
    protected function deletePublicFile(?string $relativePath): void
    {
        if (!$relativePath) return;
        $fullPath = public_path("storage/{$relativePath}");
        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }

    /**
     * Get the public URL for a stored file
     */
    protected function publicFileUrl(?string $relativePath): ?string
    {
        if (!$relativePath) return null;
        return asset("storage/{$relativePath}");
    }
}
