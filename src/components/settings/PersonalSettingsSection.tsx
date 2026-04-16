/**
 * PersonalSettingsSection - Account settings rows (name, birthdate, email, phone, zip).
 * Ported from squad-demo/src/screens/settings/PersonalSettingsSection.tsx.
 */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors, useTheme } from '../../theme/ThemeContext';
import { BodyRegular } from '../ux/text/Typography';

export type UserSettingsData = {
  displayName?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  zipCode?: string;
};

export type PersonalSettingsSectionRef = {
  getUpdatedInfo: () => UserSettingsData | null;
};

export type PersonalSettingsSectionProps = {
  user: UserSettingsData | null;
  onUserInfoChanged?: (hasChanged: boolean) => void;
};

const PersonalSettingsSection = forwardRef<
  PersonalSettingsSectionRef,
  PersonalSettingsSectionProps
>(function PersonalSettingsSection({ user, onUserInfoChanged }, ref) {
  const [name, setName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [birthday, setBirthday] = useState(user?.birthday ?? '');
  const [zipcode, setZipcode] = useState(user?.zipCode ?? '');
  const { theme, baseThemeColors } = useTheme();

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBirthday(user.birthday || '');
      setZipcode(user.zipCode || '');
    }
  }, [user]);

  useImperativeHandle(ref, () => ({
    getUpdatedInfo() {
      if (!user) return null;
      return {
        ...user,
        displayName: name,
        email,
        phone,
        birthday,
        zipCode: zipcode,
      };
    },
  }));

  useEffect(() => {
    const hasChanged =
      name !== (user?.displayName ?? '') ||
      email !== (user?.email ?? '') ||
      phone !== (user?.phone ?? '') ||
      birthday !== (user?.birthday ?? '') ||
      zipcode !== (user?.zipCode ?? '');
    onUserInfoChanged?.(hasChanged);
  }, [name, email, phone, birthday, zipcode, user, onUserInfoChanged]);

  if (!user) return null;

  const textColor = theme.isDarkMode
    ? baseThemeColors.primaryWhiteColor
    : baseThemeColors.primaryTextColor;

  return (
    <View>
      <View style={styles.rowOptionContainer}>
        <BodyRegular style={[styles.titleStyle, { color: textColor }]}>
          First Name
        </BodyRegular>
        <TextInput
          value={name}
          style={[styles.inputStyle, { color: textColor }]}
          onChangeText={setName}
          maxLength={30}
          placeholder="First Name"
          placeholderTextColor={Colors.gray6}
        />
      </View>
      <View style={styles.separator} />

      <View style={styles.rowOptionContainer}>
        <BodyRegular style={[styles.titleStyle, { color: textColor }]}>
          Birthdate
        </BodyRegular>
        <TextInput
          value={birthday}
          style={[styles.inputStyle, { color: textColor }]}
          onChangeText={setBirthday}
          placeholder="Add Birthdate"
          placeholderTextColor={Colors.gray6}
        />
      </View>
      <View style={styles.separator} />

      <View style={styles.rowOptionContainer}>
        <BodyRegular style={[styles.titleStyle, { color: textColor }]}>
          Email
        </BodyRegular>
        <TextInput
          value={email}
          style={[styles.inputStyle, { color: textColor }]}
          onChangeText={setEmail}
          autoCapitalize="none"
          placeholder="Add Email"
          keyboardType="email-address"
          placeholderTextColor={Colors.gray6}
        />
      </View>
      <View style={styles.separator} />

      <View style={styles.rowOptionContainer}>
        <BodyRegular style={[styles.titleStyle, { color: textColor }]}>
          Phone
        </BodyRegular>
        <TextInput
          value={phone}
          style={[styles.inputStyle, { color: textColor }]}
          onChangeText={setPhone}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          placeholderTextColor={Colors.gray6}
        />
      </View>
      <View style={styles.separator} />

      <View style={styles.rowOptionContainer}>
        <BodyRegular style={[styles.titleStyle, { color: textColor }]}>
          Zip Code
        </BodyRegular>
        <TextInput
          value={zipcode}
          style={[styles.inputStyle, { color: textColor }]}
          onChangeText={setZipcode}
          keyboardType="number-pad"
          placeholder="Zip Code"
          placeholderTextColor={Colors.gray6}
        />
      </View>
      <View style={styles.separator} />
    </View>
  );
});

export default PersonalSettingsSection;

const styles = StyleSheet.create({
  inputStyle: {
    color: Colors.white,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
  },
  rowOptionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    marginVertical: 16,
    width: '100%',
  },
  titleStyle: {
    color: Colors.white,
  },
});
