/*
 * Copyright 2025 ESC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class EscOAuthError extends Error {
  constructor(message, code = "ESC_OAUTH_ERROR", status = 500, details = null) {
    super(message);
    this.name = "EscOAuthError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const parseAxiosError = (err) => {
  if (err.response) {
    return new EscOAuthError(
      err.response.data?.message || "Erro retornado pela API ESC",
      err.response.data?.code || "ESC_API_ERROR",
      err.response.status,
      err.response.data
    );
  }

  if (err.request) {
    return new EscOAuthError(
      "Não foi possível se comunicar com a API ESC",
      "ESC_NETWORK_ERROR",
      503
    );
  }

  return new EscOAuthError(
    err.message || "Erro desconhecido",
    "ESC_UNKNOWN_ERROR",
    500
  );
};

module.exports = {
  EscOAuthError,
  parseAxiosError
};
