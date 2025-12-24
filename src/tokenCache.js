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
const cache = new Map();

const setTokenCache = (accessToken, data, expiresIn = 3600) => {
  cache.set(accessToken, {
    data,
    expiresAt: Date.now() + expiresIn * 1000
  });
};

const getTokenCache = (accessToken) => {
  const entry = cache.get(accessToken);
  if (!entry) return null;

  if (entry.expiresAt < Date.now()) {
    cache.delete(accessToken);
    return null;
  }

  return entry.data;
};

const clearTokenCache = () => cache.clear();

module.exports = {
  setTokenCache,
  getTokenCache,
  clearTokenCache
};
