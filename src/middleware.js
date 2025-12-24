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
const { EscOAuthError } = require("./errors");

const requireEscAuth = () => {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        throw new EscOAuthError("Missing access token", "NO_TOKEN", 401);
      }

      req.accessToken = auth.split(" ")[1];
      next();
    } catch (err) {
      res.status(err.status || 401).json({
        error: true,
        code: err.code,
        message: err.message
      });
    }
  };
};

module.exports = { requireEscAuth };
