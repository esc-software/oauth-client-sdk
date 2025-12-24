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
const axios = require("axios");
const { parseAxiosError } = require("./errors");
const { logger } = require("./logger");
const { setTokenCache, getTokenCache } = require("./tokenCache");
const { allowRequest } = require("./rateLimiter");
const { emitTelemetry } = require("./telemetry");

class EscOAuthClient {
  constructor(config) {
    this.config = config;
    this.config.apiUrl = ""
    this.config.oauthUrl = ""
  }

  getAuthorizationUrl(scopes = ["identify"]) {
    const { oauthUrl, clientId, redirectUri } = this.config;

    if (!Array.isArray(scopes)) {
        throw new Error("Scopes must be an array");
    }

    const scopeParam = [...new Set(scopes)]
        .map(s => String(s).trim())
        .filter(Boolean)
        .join(" ");

    return `${oauthUrl}/authorize/login?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopeParam)}`;
  }

  async exchangeCode(code) {
    try {
      if (!allowRequest("exchangeCode")) {
        throw new Error("Client rate limit exceeded");
      }

      logger("info", "Exchanging authorization code");

      const res = await axios.post(`${this.config.apiUrl}/api/v1/auth/token`, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code
      });

      return res.data;
    } catch (err) {
      emitTelemetry("TOKEN_EXCHANGE_ERROR", err);
      throw parseAxiosError(err);
    }
  }

  async refreshToken(refreshToken) {
    try {
      if (!allowRequest("refreshToken")) {
        throw new Error("Client rate limit exceeded");
      }

      logger("info", "Refreshing access token");

      const res = await axios.post(`${this.config.apiUrl}/api/v1/auth/refresh-token`, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken
      });

      return res.data;
    } catch (err) {
      emitTelemetry("REFRESH_TOKEN_ERROR", err);
      throw parseAxiosError(err);
    }
  }

  async getMe(accessToken) {
    const cached = getTokenCache(accessToken);
    if (cached) return cached;

    try {
      logger("info", "Fetching /@me");

      const res = await axios.get(`${this.config.apiUrl}/api/v1/users/@me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      setTokenCache(accessToken, res.data, 3600);
      return res.data;
    } catch (err) {
      emitTelemetry("GET_ME_ERROR", err);
      throw parseAxiosError(err);
    }
  }
}

module.exports = { EscOAuthClient };
