/**
 * CommunityThemeSyncer — Syncs community colors to theme context.
 * When the user's community changes, calls switchTheme so the entire
 * app gets the correct theme without screen-level logic.
 * Ported from squad-demo/src/components/sentinels/CommunityThemeSyncer.tsx.
 */
import { useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { reUserCommunity } from '../../state/communities';
import { useTheme, buildCommunityTheme, defaultTheme } from '../../theme/ThemeContext';

export default function CommunityThemeSyncer() {
  const community = useRecoilValue(reUserCommunity) as any;
  const { switchTheme } = useTheme();
  const prevCommunityIdRef = useRef<string | null>(null);

  useEffect(() => {
    const communityId = community?.id ?? null;

    if (communityId === prevCommunityIdRef.current) return;
    prevCommunityIdRef.current = communityId;

    if (community?.color) {
      console.log('[CommunityThemeSyncer] Switching theme to:', community.name);
      switchTheme(buildCommunityTheme(community.color, community.secondaryColor));
    } else {
      console.log('[CommunityThemeSyncer] Resetting to default theme');
      switchTheme(defaultTheme);
    }
  }, [community, switchTheme]);

  return null;
}
