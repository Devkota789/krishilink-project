export function handleApiResponse(response) {
  const data = response.data;
  if (data.success) {
    return { success: true, data: data.data, message: data.message, status: data.status };
  } else {
    // ApiResponse<T> with success: false or ApiError<T>
    let errorMsg = data.message || data.title || 'Request failed';
    let errorDetails = [];
    if (Array.isArray(data.errors)) {
      errorDetails = data.errors;
    } else if (data.errors && typeof data.errors === 'object') {
      errorDetails = Object.values(data.errors).flat();
    }
    return { success: false, error: errorMsg, errorDetails, status: data.status || data.Status };
  }
} 