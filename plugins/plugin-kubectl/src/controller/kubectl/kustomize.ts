/*
 * Copyright 2019 IBM Corporation
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

import { resolve, basename } from 'path'
import { Arguments, Menu, Registrar, i18n } from '@kui-shell/core'

import flags from './flags'
import { kindPartOf } from './fqn'
import { KubeOptions } from './options'
import { doExecWithStdout } from './exec'
import commandPrefix from '../command-prefix'
import { KubeResource } from '../../lib/model/resource'

import { isUsage, doHelp } from '../../lib/util/help'

const strings = i18n('plugin-kubectl', 'kustomize')

function groupByKind(resources: KubeResource[], rawFull: string): Menu[] {
  const rawSplit = rawFull.split(/---/)

  const groups = resources.reduce((groups, resource, idx) => {
    const key = kindPartOf(resource)

    const group = groups[key]
    if (!group) {
      groups[key] = {
        modes: []
      }
    }

    groups[key].modes.push({
      mode: resource.metadata.name,
      content: rawSplit[idx].replace(/^\n/, ''),
      contentType: 'yaml'
    })

    return groups
  }, {} as Menu)

  const rawMenu: Menu = {
    [strings('Raw Data')]: {
      modes: [
        {
          mode: 'YAML',
          content: rawFull,
          contentType: 'yaml'
        }
      ]
    }
  }

  // align to the somewhat odd NavResponse Menu model
  return Object.keys(groups)
    .map(group => ({
      [group]: groups[group]
    }))
    .concat([rawMenu])
}

export const doKustomize = (command = 'kubectl') => async (args: Arguments<KubeOptions>) => {
  if (isUsage(args)) {
    return doHelp(command, args)
  } else {
    const [yaml, { safeLoadAll }] = await Promise.all([doExecWithStdout(args, undefined, command), import('js-yaml')])
    try {
      const resources = safeLoadAll(yaml)
      const inputFile = resolve(args.argvNoOptions[args.argvNoOptions.indexOf('kustomize') + 1])

      return {
        apiVersion: 'kui-shell/v1',
        kind: 'NavResponse',
        breadcrumbs: [{ label: 'kustomize' }, { label: basename(inputFile), command: `open ${inputFile}` }],
        menus: groupByKind(resources, yaml)
      }
    } catch (err) {
      console.error('error preparing kustomize response', err)
      return yaml
    }
  }
}

export default (registrar: Registrar) => {
  registrar.listen(`/${commandPrefix}/kubectl/kustomize`, doKustomize(), flags)
  registrar.listen(`/${commandPrefix}/k/kustomize`, doKustomize(), flags)
}