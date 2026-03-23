/**
 * Device contacts atoms.
 * Ported from squad-demo/src/atoms/contacts.ts.
 */
import { atom } from 'recoil';

export interface DeviceContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
  imageUri?: string;
}

export const deviceContacts = atom<DeviceContact[]>({
  key: 'squad-sdk:contacts:device',
  default: [],
});

export const contactsLoaded = atom<boolean>({
  key: 'squad-sdk:contacts:loaded',
  default: false,
});

export const contactsOnSquad = atom<string[]>({
  key: 'squad-sdk:contacts:onSquad',
  default: [],
});
