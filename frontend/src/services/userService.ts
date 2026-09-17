// ============================================================
// AUTH HEADERS
// ============================================================

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('authToken');

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

// ============================================================
// GET USERS
// ============================================================

export async function fetchUsers() {
  const response =
    await fetch('/api/User', {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
      },
    });

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      'Failed to fetch users'
    );
  }

  const data = await response.json();

  // --------------------------------------------------------
  // TEMP FIX: backend (likely ASP.NET Core default) may return
  // PascalCase field names (e.g. "ImagePath") while the rest of
  // the frontend expects camelCase ("imagePath"). Normalize just
  // the image field here so it isn't silently undefined.
  //
  // Remove this once the backend is configured to return
  // camelCase JSON globally — in Program.cs:
  //
  // builder.Services.AddControllers()
  //     .AddJsonOptions(options =>
  //     {
  //         options.JsonSerializerOptions.PropertyNamingPolicy =
  //             JsonNamingPolicy.CamelCase;
  //     });
  // --------------------------------------------------------
  return Array.isArray(data)
    ? data.map((u: any) => ({
        ...u,
        imagePath: u.imagePath ?? u.ImagePath ?? '',
      }))
    : data;
}

// ============================================================
// GET USER BY ID
// ============================================================

export async function fetchUserById(
  id: number
) {
  const response =
    await fetch(
      `/api/User/${id}`,
      {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
        },
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      'Failed to fetch user'
    );
  }

  const data = await response.json();

  // Same normalization as fetchUsers — remove once backend
  // returns camelCase JSON globally.
  return {
    ...data,
    imagePath: data.imagePath ?? data.ImagePath ?? '',
  };
}

// ============================================================
// CREATE USER
// ============================================================

export async function createUser(
  formData: FormData
) {
  const response =
    await fetch(
      '/api/User',
      {
        method: 'POST',

        headers: {
          /*
           * IMPORTANT:
           *
           * DO NOT add:
           *
           * 'Content-Type':
           * 'multipart/form-data'
           *
           * The browser automatically
           * creates the correct boundary.
           */

          ...getAuthHeaders(),
        },

        body: formData,
      }
    );

  const responseText =
    await response.text();

  if (!response.ok) {
    let message =
      'Failed to create user';

    try {
      const errorData =
        JSON.parse(
          responseText
        );

      message =
        errorData.message ||
        errorData.title ||
        errorData.error ||
        errorData.detail ||
        message;
    } catch {
      if (responseText) {
        message =
          responseText;
      }
    }

    throw new Error(
      `${message} (Status: ${response.status})`
    );
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(
      responseText
    );
  } catch {
    return responseText;
  }
}

// ============================================================
// UPDATE USER
// ============================================================

export async function updateUser(
  id: number,
  formData: FormData
) {
  const response =
    await fetch(
      `/api/User/${id}`,
      {
        method: 'PUT',

        headers: {
          /*
           * DO NOT set Content-Type.
           *
           * Browser handles multipart/form-data.
           */

          ...getAuthHeaders(),
        },

        body: formData,
      }
    );

  const responseText =
    await response.text();

  if (!response.ok) {
    let message =
      'Failed to update user';

    try {
      const errorData =
        JSON.parse(
          responseText
        );

      message =
        errorData.message ||
        errorData.title ||
        errorData.error ||
        errorData.detail ||
        message;
    } catch {
      if (responseText) {
        message =
          responseText;
      }
    }

    throw new Error(
      `${message} (Status: ${response.status})`
    );
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(
      responseText
    );
  } catch {
    return responseText;
  }
}

// ============================================================
// DELETE USER
// ============================================================

export async function deleteUser(
  id: number
) {
  const response =
    await fetch(
      `/api/User/${id}`,
      {
        method: 'DELETE',

        headers: {
          ...getAuthHeaders(),
        },
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      errorText ||
      'Failed to delete user'
    );
  }

  return true;
}