/**
 * The ElevenLabs message payload has no language field, so the console guesses.
 * Spanish marks: accents, inverted punctuation, and a few very common words.
 */
const SPANISH_WORDS =
  /\b(el|la|los|las|de|que|y|en|un|una|con|por|para|es|está|estoy|encontré|cambié|agregué|fuga|presión|también|gracias|hola|sí|no|pero|hay|del|al|se|mi|su)\b/gi;

export function detectLanguage(text: string): "en" | "es" {
  if (/[¿¡ñáéíóúü]/i.test(text)) return "es";
  const hits = text.match(SPANISH_WORDS)?.length ?? 0;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  return hits / words > 0.3 && hits >= 2 ? "es" : "en";
}
