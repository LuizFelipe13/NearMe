import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../theme';

interface Props {
  onSearch: (query: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({ onSearch, onFocus, placeholder, autoFocus }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = () => { if (query.trim()) onSearch(query.trim()); };
  const handleClear = () => { setQuery(''); onSearch(''); };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        onFocus={onFocus}
        placeholder={placeholder || 'Buscar restaurante, farmácia...'}
        placeholderTextColor={Colors.textLight}
        returnKeyType="search"
        autoFocus={autoFocus}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={18} color={Colors.textLight} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, ...Shadow.sm, borderWidth: 1, borderColor: Colors.border },
  icon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: 14, color: Colors.text, padding: 0 },
});
