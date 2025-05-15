import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
}

export default function GroceryScreen() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  const handleConfirmChanges = () => {
    const nonEmptyItems = groceryItems.filter(item => item.name.trim() !== '');
    setGroceryItems(nonEmptyItems);
    setShowConfirmButton(false);
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...groceryItems];
    newItems[index] = { ...newItems[index], name: value };
    setGroceryItems(newItems);
    
    // Only show confirm button if there are non-empty items
    const hasNonEmptyItems = newItems.some(item => item.name.trim() !== '');
    setShowConfirmButton(hasNonEmptyItems);
  };

  // ... existing code ...
} 