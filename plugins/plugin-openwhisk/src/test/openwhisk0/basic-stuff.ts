/*
 * Copyright 2017 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A simple test to verify a visible window is opened with a title
 *
 */

import { Common, CLI, ReplExpect } from '@kui-shell/test'

import * as openwhisk from '@kui-shell/plugin-openwhisk/tests/lib/openwhisk/openwhisk'

describe('openwhisk namespace display', function(this: Common.ISuite) {
  before(openwhisk.before(this))
  after(Common.after(this))

  if (openwhisk.expectedNamespace()) {
    console.error('!!!!!', openwhisk.expectedNamespace())
    it(`execute wsk namespace current expecting ${openwhisk.expectedNamespace()}`, () => {
      return CLI.command('wsk namespace current', this.app)
        .then(ReplExpect.okWithString(openwhisk.expectedNamespace()))
        .catch(Common.oops(this))
    })
  }
})
