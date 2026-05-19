# File Upload Flow Diagram

## 📊 Visual Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER UPLOADS FILE                         │
│                         (Any Size)                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Check File    │
                    │  Extension     │
                    └────────┬───────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐  ┌─────────┐  ┌──────────┐
         │   GIF    │  │  IMAGE  │  │  OTHER   │
         │   File   │  │  File   │  │   File   │
         └────┬─────┘  └────┬────┘  └────┬─────┘
              │             │             │
              │             │             │
              ▼             ▼             ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │   Upload     │ │   Process    │ │   Upload     │
      │   Original   │ │   & Compress │ │   Directly   │
      │   Size       │ │              │ │              │
      └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
             │                │                 │
             │                │                 │
             └────────────────┼─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  File Stored    │
                    │  in Storage     │
                    └─────────────────┘
```

## 🔄 Image Compression Process (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE FILE DETECTED                           │
│                  (JPG, PNG, WEBP, BMP)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Load Image    │
                    │  Quality: 90%  │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Encode &      │
                    │  Save Temp     │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Check Size    │
                    │  < 500KB?      │
                    └────────┬───────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                YES │                 │ NO
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │   DONE!      │  │  Quality     │
            │   Save File  │  │  > 60%?      │
            └──────────────┘  └──────┬───────┘
                                     │
                            ┌────────┴────────┐
                            │                 │
                        YES │                 │ NO
                            │                 │
                            ▼                 ▼
                    ┌──────────────┐  ┌──────────────┐
                    │  Reduce      │  │  Resize      │
                    │  Quality     │  │  Image       │
                    │  by 5%       │  │  by 10%      │
                    └──────┬───────┘  └──────┬───────┘
                           │                 │
                           │                 ▼
                           │         ┌──────────────┐
                           │         │  Reset       │
                           │         │  Quality     │
                           │         │  to 85%      │
                           │         └──────┬───────┘
                           │                │
                           └────────┬───────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │  Try Again   │
                            │  (Loop)      │
                            └──────────────┘
```

## 📈 Size Reduction Strategy

```
Original Image: 2.5 MB
│
├─ Attempt 1: Quality 90% → 1.2 MB (still > 500KB)
│
├─ Attempt 2: Quality 85% → 950 KB (still > 500KB)
│
├─ Attempt 3: Quality 80% → 780 KB (still > 500KB)
│
├─ Attempt 4: Quality 75% → 650 KB (still > 500KB)
│
├─ Attempt 5: Quality 70% → 580 KB (still > 500KB)
│
├─ Attempt 6: Quality 65% → 520 KB (still > 500KB)
│
├─ Attempt 7: Quality 60% → 480 KB ✅ SUCCESS!
│
└─ Final: 480 KB (81% reduction)
```

## 🎯 File Type Decision Tree

```
                        File Upload
                            │
                            ▼
                    ┌───────────────┐
                    │  Extension?   │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    .gif file          Image file          Other file
        │                   │                   │
        │              ┌────┴────┐              │
        │              │         │              │
        ▼              ▼         ▼              ▼
   Original       .jpg/.png   .webp/.bmp    Direct
    Size          Compress    Compress      Upload
        │              │         │              │
        └──────────────┴─────────┴──────────────┘
                            │
                            ▼
                    Stored in Storage
```

## 💾 Storage Structure

```
backend/public/storage/
│
├── products/
│   ├── abc123.jpg (compressed)
│   ├── def456.png (compressed)
│   └── ghi789.gif (original)
│
├── hero-images/
│   ├── xyz123.jpg (compressed)
│   └── uvw456.gif (original)
│
├── categories/
│   └── cat123.png (compressed)
│
└── test-uploads/
    ├── test001.jpg (compressed)
    └── test002.gif (original)
```

## 🔢 Compression Statistics Example

```
┌─────────────────────────────────────────────────────────┐
│                    UPLOAD STATISTICS                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Original File:                                          │
│  ├─ Name: vacation-photo.jpg                            │
│  ├─ Size: 2,048 KB (2 MB)                               │
│  └─ Dimensions: 4000 x 3000 px                          │
│                                                          │
│  Processing:                                             │
│  ├─ Iterations: 7                                        │
│  ├─ Final Quality: 60%                                   │
│  ├─ Resized: No                                          │
│  └─ Time: 2.3 seconds                                    │
│                                                          │
│  Final File:                                             │
│  ├─ Name: abc123xyz.jpg                                  │
│  ├─ Size: 480 KB                                         │
│  ├─ Dimensions: 4000 x 3000 px (unchanged)              │
│  └─ Compression: 76.6%                                   │
│                                                          │
│  Result: ✅ SUCCESS - Under 500KB                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎬 GIF Handling

```
┌─────────────────────────────────────────────────────────┐
│                    GIF FILE DETECTED                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  File: animated-banner.gif                               │
│  Size: 3.2 MB                                            │
│  Frames: 45                                              │
│                                                          │
│  Decision: PRESERVE ORIGINAL                             │
│  Reason: Maintain animation quality                      │
│                                                          │
│  Processing:                                             │
│  ├─ Compression: SKIPPED ⏭️                              │
│  ├─ Quality Reduction: SKIPPED ⏭️                        │
│  └─ Resize: SKIPPED ⏭️                                   │
│                                                          │
│  Result:                                                 │
│  ├─ Original Size: 3.2 MB                                │
│  ├─ Final Size: 3.2 MB                                   │
│  └─ Status: ✅ UPLOADED (Original)                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔄 API Request/Response Flow

```
CLIENT                          SERVER
  │                               │
  │  POST /api/test-upload        │
  │  ─────────────────────────>   │
  │  File: image.jpg (2MB)        │
  │  Token: Bearer xxx            │
  │                               │
  │                               ├─ Validate Request
  │                               ├─ Check File Type
  │                               ├─ Process Image
  │                               │  ├─ Load
  │                               │  ├─ Compress
  │                               │  └─ Save
  │                               ├─ Calculate Stats
  │                               │
  │  <─────────────────────────   │
  │  Response: 200 OK             │
  │  {                            │
  │    "success": true,           │
  │    "data": {                  │
  │      "original": {            │
  │        "size_kb": 2000        │
  │      },                       │
  │      "final": {               │
  │        "size_kb": 480         │
  │      },                       │
  │      "compression": {         │
  │        "ratio": "76%"         │
  │      }                        │
  │    }                          │
  │  }                            │
  │                               │
```

## 🎨 Supported Formats Overview

```
┌──────────────────────────────────────────────────────────┐
│                    FILE TYPE SUPPORT                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ COMPRESSED (< 500KB)                                  │
│  ├─ JPG/JPEG                                              │
│  ├─ PNG                                                   │
│  ├─ WEBP                                                  │
│  └─ BMP                                                   │
│                                                           │
│  ✅ ORIGINAL SIZE (No Compression)                        │
│  └─ GIF (preserves animation)                             │
│                                                           │
│  ✅ DIRECT UPLOAD (No Processing)                         │
│  ├─ PDF                                                   │
│  ├─ DOC/DOCX                                              │
│  ├─ MP4/Video                                             │
│  └─ Other files                                           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```
