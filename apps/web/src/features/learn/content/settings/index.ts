import type { SettingScope } from '../../settingsCatalog';
import type { SettingGuide } from '../../types';
import { connectionSettings } from './connections';
import { coreSettings } from './core';
import { dataSettings } from './data';
import { messagingSettings } from './messaging';
import { securitySettings } from './security';

/** Explanations of every component setting. */
export const COMPONENT_SETTING_GUIDES: SettingGuide[] = [...coreSettings, ...dataSettings, ...messagingSettings, ...securitySettings];

/** Explanations of every connection (arrow) setting. */
export const CONNECTION_SETTING_GUIDES: SettingGuide[] = connectionSettings;

const componentGuides = new Map(COMPONENT_SETTING_GUIDES.map((g) => [g.key, g]));
const connectionGuides = new Map(CONNECTION_SETTING_GUIDES.map((g) => [g.key, g]));

export function getSettingGuide(key: string, scope: SettingScope = 'component'): SettingGuide | undefined {
  return (scope === 'connection' ? connectionGuides : componentGuides).get(key);
}
