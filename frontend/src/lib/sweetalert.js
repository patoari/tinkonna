import Swal from 'sweetalert2'

// Custom SweetAlert2 configurations
const swalConfig = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#6b7280',
  confirmButtonText: 'Yes',
  cancelButtonText: 'Cancel',
}

// Confirmation dialog
export const confirmDialog = ({
  title = 'Are you sure?',
  text = '',
  icon = 'warning',
  confirmButtonText = 'Yes, proceed',
  cancelButtonText = 'Cancel',
  confirmButtonColor = '#3b82f6',
  cancelButtonColor = '#6b7280',
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  })
}

// Delete confirmation
export const confirmDelete = ({
  title = 'Delete this item?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes, delete it',
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
  })
}

// Success alert
export const successAlert = ({
  title = 'Success!',
  text = '',
  timer = 2000,
  showConfirmButton = false,
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer,
    showConfirmButton,
    timerProgressBar: true,
  })
}

// Error alert
export const errorAlert = ({
  title = 'Error!',
  text = 'Something went wrong.',
  confirmButtonText = 'OK',
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#3b82f6',
    confirmButtonText,
  })
}

// Info alert
export const infoAlert = ({
  title = 'Information',
  text = '',
  confirmButtonText = 'OK',
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'info',
    confirmButtonColor: '#3b82f6',
    confirmButtonText,
  })
}

// Warning alert
export const warningAlert = ({
  title = 'Warning!',
  text = '',
  confirmButtonText = 'OK',
} = {}) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    confirmButtonColor: '#3b82f6',
    confirmButtonText,
  })
}

// Loading alert
export const loadingAlert = ({
  title = 'Please wait...',
  text = 'Processing your request',
} = {}) => {
  return Swal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    },
  })
}

// Close loading alert
export const closeLoading = () => {
  Swal.close()
}

export default Swal
