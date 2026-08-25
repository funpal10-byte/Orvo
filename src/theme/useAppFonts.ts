import { useFonts as useOutfit, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { useFonts as useManrope, Manrope_400Regular, Manrope_500Medium } from '@expo-google-fonts/manrope';
import {
  useFonts as useJetBrainsMono,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';

// Fonts are bundled with the app (per handoff) rather than fetched at runtime —
// @expo-google-fonts ships the .ttf files inside the package itself.
export function useAppFonts() {
  const [outfitLoaded] = useOutfit({ Outfit_500Medium, Outfit_600SemiBold });
  const [manropeLoaded] = useManrope({ Manrope_400Regular, Manrope_500Medium });
  const [monoLoaded] = useJetBrainsMono({ JetBrainsMono_400Regular, JetBrainsMono_500Medium });
  return outfitLoaded && manropeLoaded && monoLoaded;
}
