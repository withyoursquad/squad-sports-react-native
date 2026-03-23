/**
 * Device permissions atoms.
 * Ported from squad-demo/src/atoms/permissions.ts.
 */
import { atom, DefaultValue, selector } from 'recoil';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'limited';

type AllPermissionsState = {
  microphone: PermissionStatus | null;
  contacts: PermissionStatus | null;
  camera: PermissionStatus | null;
  images: PermissionStatus | null;
  notifications: PermissionStatus | null;
};

const permissionsAtom = atom<AllPermissionsState>({
  key: 'squad-sdk:permissions',
  default: {
    microphone: null,
    contacts: null,
    camera: null,
    images: null,
    notifications: null,
  },
});

function makePermissionSelector(field: keyof AllPermissionsState) {
  return selector<PermissionStatus | null>({
    key: `squad-sdk:permissions:${field}`,
    get: ({ get }) => get(permissionsAtom)[field],
    set: ({ get, set }, newValue) => {
      if (newValue instanceof DefaultValue) return;
      set(permissionsAtom, { ...get(permissionsAtom), [field]: newValue });
    },
  });
}

export const microphonePermissions = makePermissionSelector('microphone');
export const contactsPermissions = makePermissionSelector('contacts');
export const cameraPermissions = makePermissionSelector('camera');
export const imagesPermissions = makePermissionSelector('images');
export const notificationsPermissions = makePermissionSelector('notifications');
