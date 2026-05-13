import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Category } from '../types';
import { Colors, Spacing, Radius, Shadow, Typography } from '../theme';

interface Props {
  category: Category;
  onPress: (category: Category) => void;
  selected?: boolean;
  compact?: boolean;
}

export default function CategoryButton({ category, onPress, selected, compact }: Props) {
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.chip, selected && styles.chipSelected]}
        onPress={() => onPress(category)}
        activeOpacity={0.8}
      >
        <Text style={styles.chipEmoji}>{category.emoji}</Text>
        <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, selected && styles.buttonSelected, { borderColor: category.color }]}
      onPress={() => onPress(category)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBg, { backgroundColor: selected ? category.color : category.backgroundColor }]}>
        <Text style={styles.emoji}>{category.emoji}</Text>
      </View>
      <Text style={[styles.label, { color: selected ? category.color : Colors.text }]} numberOfLines={2}>
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80, alignItems: 'center', padding: Spacing.sm,
    borderRadius: Radius.md, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: 'transparent', ...Shadow.sm, marginRight: Spacing.sm,
  },
  buttonSelected: { backgroundColor: Colors.surface },
  iconBg: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  emoji: { fontSize: 22 },
  label: { ...Typography.label, textAlign: 'center', color: Colors.textSecondary },
  chip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.full, backgroundColor: Colors.borderLight, marginRight: Spacing.sm },
  chipSelected: { backgroundColor: Colors.primary },
  chipEmoji: { fontSize: 14 },
  chipLabel: { ...Typography.label, color: Colors.text },
  chipLabelSelected: { color: Colors.surface },
});
