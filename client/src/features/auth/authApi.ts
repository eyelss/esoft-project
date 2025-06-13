
export const fetchUsers = async () => await fetch('api/users/');

export type VerifySuccess = {
  login: string;
}

export type VerifyError = {
  message: string;
  body: string[];
}

function isHttpError(value: unknown): value is VerifyError {
  return (
    typeof value === 'object' && 
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'body' in value &&
    Array.isArray(value.body) &&
    typeof value.body[0] === 'string'
  );
}

function isVerifySuccess(value: unknown): value is VerifySuccess {
  return (
    typeof value === 'object' &&
    value !== null &&
    'login' in value &&
    typeof value.login === 'string'
  );
}

export const verifySession = async (): Promise<VerifySuccess> => {
  const response = await fetch('/api/auth/verify', {
    method: 'POST'
  });

  const body = await response.json();

  if (isHttpError(body)) {
    throw new Error(body.message);
  }

  if (isVerifySuccess(body)) {
    return body;
  }

  throw new Error('Cannot handle type of response');
}

// export const fetchVerify = async () => {
//   try {
//     const response = 
//   }
// }