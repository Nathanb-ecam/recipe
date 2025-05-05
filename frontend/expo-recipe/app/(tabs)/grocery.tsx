import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Modal, Pressable } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { groceryApi } from '../../services/groceryApi';
import { GroceryIngredient } from '../../types/grocery';
import { FontAwesome } from '@expo/vector-icons';

const INGREDIENT_TYPES = ['VEGETABLE', 'FRUITS', 'MEAT', 'FISH', 'BISCUITS', 'SNACKS'];
const QUANTITY_UNITS = ['pc(s)', 'g', 'kg', 'L'];

export default function GroceryScreen() {
  const [groceryList, setGroceryList] = useState<GroceryIngredient[]>([]);
  const [newItem, setNewItem] = useState({
    ingredientName: '',
    ingredientType: '',
    quantity: { value: 0, unit: 'pc(s)' }
  });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = async () => {
    try {
      const data = await groceryApi.getGroceryList();
      setGroceryList(data.products || []);
    } catch (error) {
      console.error('Error loading grocery list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.ingredientName.trim() || !newItem.ingredientType) return;

    const updatedList = [...groceryList, newItem];
    try {
      await groceryApi.updateGroceryList(updatedList);
      setGroceryList(updatedList);
      setNewItem({
        ingredientName: '',
        ingredientType: '',
        quantity: { value: 0, unit: 'pc(s)' }
      });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (index: number) => {
    const updatedList = groceryList.filter((_, i) => i !== index);
    try {
      await groceryApi.updateGroceryList(updatedList);
      setGroceryList(updatedList);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const filteredItems = selectedType === 'ALL' 
    ? groceryList 
    : groceryList.filter(item => item.ingredientType === selectedType);

  const handleUnitSelect = (unit: string) => {
    setNewItem({
      ...newItem,
      quantity: { ...newItem.quantity, unit }
    });
    setShowUnitPicker(false);
  };

  const handleTypeSelect = (type: string) => {
    setNewItem({
      ...newItem,
      ingredientType: type
    });
    setShowTypePicker(false);
  };

  const renderItem = ({ item, index }: { item: GroceryIngredient; index: number }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.ingredientName}</Text>
        <Text style={styles.itemQuantity}>
          {item.quantity.value} {item.quantity.unit}
        </Text>
        <Text style={styles.itemType}>{item.ingredientType}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(index)}
      >
        <FontAwesome name="trash" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Grocery List</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === 'ALL' && styles.selectedFilter]}
            onPress={() => setSelectedType('ALL')}
          >
            <Text style={[styles.filterText, selectedType === 'ALL' && styles.selectedFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          {INGREDIENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, selectedType === type && styles.selectedFilter]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterText, selectedType === type && styles.selectedFilterText]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="ex: Banana's"
              value={newItem.ingredientName}
              onChangeText={(text) => setNewItem({ ...newItem, ingredientName: text })}
            />
            <TextInput
              style={[styles.input, styles.quantityInput]}
              placeholder="Value"
              keyboardType="numeric"
              value={newItem.quantity.value.toString()}
              onChangeText={(text) => setNewItem({
                ...newItem,
                quantity: { ...newItem.quantity, value: parseFloat(text) || 0 }
              })}
            />
            <TouchableOpacity
              style={[styles.input, styles.unitInput]}
              onPress={() => setShowUnitPicker(true)}
            >
              <Text style={styles.unitText}>{newItem.quantity.unit}</Text>
              <FontAwesome name="chevron-down" size={12} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <View 
              style={[styles.input, styles.typeInput]}
              onTouchEnd={() => setShowTypePicker(true)}
            >
              <Text style={styles.typeText}>
                {newItem.ingredientType || 'Select Type'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddItem}
            >
              <FontAwesome name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showUnitPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {QUANTITY_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  style={[styles.modalItem, newItem.quantity.unit === unit && styles.selectedModalItem]}
                  onPress={() => handleUnitSelect(unit)}
                >
                  <Text style={[styles.modalText, newItem.quantity.unit === unit && styles.selectedModalText]}>
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showTypePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {INGREDIENT_TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[styles.modalItem, newItem.ingredientType === type && styles.selectedModalItem]}
                  onPress={() => handleTypeSelect(type)}
                >
                  <Text style={[styles.modalText, newItem.ingredientType === type && styles.selectedModalText]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
    backgroundColor: '#f8f8f8',
  },
  selectedFilter: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  nameInput: {
    flex: 2,
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unitText: {
    fontSize: 14,
    color: '#333',
  },
  typeInput: {
    flex: 1,
    justifyContent: 'center',
  },
  typeText: {
    fontSize: 14,
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxHeight: '80%',
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedModalItem: {
    backgroundColor: '#f8f8f8',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalText: {
    color: '#FFD700',
    fontWeight: '600',
  },
}); 