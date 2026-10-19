'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
type PlaceSuggestion = google.maps.places.AutocompleteSuggestion;
export function PlaceInput({
  value,
  onChange,
  onBlur,
  name,
  invalid,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: 'pickup' | 'drop';
  invalid?: boolean;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const selectedValue = useRef('');
  const listId = `${name}-place-suggestions`;

  useEffect(() => {
    const query = value.trim();
    ++requestId.current;
    if (query === selectedValue.current || query.length < 2 || !window.google?.maps) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const places = (await google.maps.importLibrary('places')) as google.maps.PlacesLibrary;
        sessionToken.current ||= new places.AutocompleteSessionToken();
        const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ['in'],
          language: 'en',
          region: 'in',
          sessionToken: sessionToken.current,
        });
        if (currentRequest === requestId.current) {
          setSuggestions(response.suggestions.filter((item) => item.placePrediction).slice(0, 6));
          setActiveIndex(-1);
        }
      } catch {
        if (currentRequest === requestId.current) setSuggestions([]);
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [value]);

  async function chooseSuggestion(suggestion: PlaceSuggestion) {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    let nextValue = prediction.text.toString();
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
      nextValue = place.formattedAddress || place.displayName || nextValue;
    } catch {
      // The prediction text is a complete route-ready address fallback.
    }
    selectedValue.current = nextValue;
    sessionToken.current = null;
    setSuggestions([]);
    setActiveIndex(-1);
    onChange(nextValue);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex])
        void chooseSuggestion(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="place-autocomplete-new">
      <input
        id={name}
        name={name}
        value={value}
        onChange={(event) => {
          selectedValue.current = '';
          onChange(event.target.value);
        }}
        onBlur={() => {
          onBlur();
          window.setTimeout(() => setSuggestions([]), 150);
        }}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={suggestions.length > 0}
        aria-activedescendant={activeIndex >= 0 ? `${name}-suggestion-${activeIndex}` : undefined}
        role="combobox"
        onKeyDown={handleKeyDown}
      />
      {loading && <span className="place-suggestion-loading" aria-hidden="true" />}
      {suggestions.length > 0 && (
        <div
          className="place-suggestion-list"
          id={listId}
          role="listbox"
          aria-label="Location suggestions"
        >
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction!;
            const primary = prediction.mainText?.toString() || prediction.text.toString();
            const secondary = prediction.secondaryText?.toString() || '';
            return (
              <button
                id={`${name}-suggestion-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={activeIndex === index ? 'active' : ''}
                key={prediction.placeId || `${primary}-${index}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void chooseSuggestion(suggestion)}
              >
                <MapPin size={17} />
                <span>
                  <strong>{primary}</strong>
                  {secondary && <small>{secondary}</small>}
                </span>
              </button>
            );
          })}
          <div className="place-suggestion-credit">Powered by Google</div>
        </div>
      )}
    </div>
  );
}
