import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, Platform, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { groceryApi } from '../../services/groceryApi';
import { GroceryIngredient } from '../../types/grocery';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';


export default function GroceryScreen() {

const mockItem : GroceryIngredient = {id: 'example', ingredientName: 'ex: bananas', ingredientType: 'fruit', quantity: {value: 1, unit: 'kg'}, alreadyBought: false};
    
  const [items, setItems] = useState<GroceryIngredient[]>([]);
  const [editingItem, setEditingItem] = useState<GroceryIngredient | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const textInputRef = useRef<TextInput>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      setLoading(true);
      const data = await groceryApi.getGrocery();
      if (data.products.length === 0) {
        data.products = [mockItem];
      }
      setItems(data.products);
    } catch (error) {
      console.error('Error loading grocery list:', error);
      setItems([mockItem]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: GroceryIngredient) => {
    setEditingItem(item);
    textInputRef.current?.focus();
  };

  const handleItemChange = (text: string, item: GroceryIngredient) => {
    const updatedItems = items.map(i => 
      i?.id === item.id ? { ...i, ingredientName: text } : i
    );
    setItems(updatedItems);
    setHasChanges(true);
  };

  const handleItemComplete = (item: GroceryIngredient) => {
    const updatedItems = items.map(i =>
      i?.id === item.id ? { ...i, alreadyBought: !i.alreadyBought } : i
    );
    setItems(updatedItems);
    setHasChanges(true);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    if (newItems.length === 0) {
      newItems.push(mockItem);
    }
    setItems(newItems);
    setHasChanges(true);
  };

  const handleAddNewItem = () => {
    const newItem: GroceryIngredient = {
      id: Date.now().toString(),
      ingredientName: '',
      ingredientType: 'other',
      quantity: { value: 1, unit: 'pc' },
      alreadyBought: false
    };
    setItems([...items, newItem]);
    setEditingItem(newItem);
    textInputRef.current?.focus();
  };

  const handleSaveChanges = async () => {
    try {
      // Filter out items with empty ingredient names
      const validItems = items.filter(item => item.ingredientName.trim() !== '');
      
      await groceryApi.updateGrocery(validItems);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving grocery list:', error);
      Alert.alert('Error', 'Failed to save grocery list');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Grocery</Text>
        {hasChanges && (
          <TouchableOpacity onPress={handleSaveChanges}>
            <FontAwesome name="check" size={24} color="#FFD700" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleItemComplete(item)}
            >
              <FontAwesome
                name={item.alreadyBought ? 'check-circle' : 'circle-o'}
                size={24}
                color={item.alreadyBought ? '#34C759' : '#8E8E93'}
              />
            </TouchableOpacity>

            {editingItem?.id === item.id ? (
              <TextInput
                ref={textInputRef}
                style={styles.input}
                value={item.ingredientName}
                onChangeText={(text) => handleItemChange(text, item)}
                onBlur={() => setEditingItem(null)}
                onSubmitEditing={() => {
                  if (!item.ingredientName.trim()) {
                    handleDeleteItem(index);
                  } else {
                    handleAddNewItem();
                  }
                }}
                autoFocus
              />
            ) : (
              <TouchableOpacity
                style={styles.itemName}
                onPress={() => handleItemPress(item)}
              >
                <Text
                  style={[
                    styles.itemText,
                    item.alreadyBought && styles.completedText,
                    item?.id === 'example' && styles.exampleText,
                  ]}
                >
                  {item.ingredientName}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  itemName: {
    flex: 1,
    padding: 8,
  },
  itemText: {
    fontSize: 17,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  exampleText: {
    color: '#8E8E93',
  },
}); 