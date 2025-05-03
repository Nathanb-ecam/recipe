import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api } from '../services/api';
import { RecipeDto, MealType } from '../types/recipe';
import { useAuth } from '../contexts/AuthContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';

type RecipeSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (recipe: RecipeDto, hourMinString: string) => void;
  mealType: MealType;
};

export const RecipeSelectionModal = ({ visible, onClose, onSelect, mealType }: RecipeSelectionModalProps) => {
  const [savedRecipes, setSavedRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDto | null>(null);
  const { user } = useAuth();

  const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

  useEffect(() => {
    if (visible) {
      loadSavedRecipes();
    }
  }, [user, mealType, visible]);

  const loadSavedRecipes = async () => {
    if (!user?.recipesIds?.length) {
      console.log('No recipe IDs found for user');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading recipes for IDs:', user.recipesIds);
      const data = await api.getRecipesFromIds(user.recipesIds);
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data);
        setSavedRecipes([]);
        return;
      }

      console.log('Total recipes loaded:', data.length);
      setSavedRecipes(data);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    let filtered = savedRecipes;
    
    // Apply meal type filter
    if (selectedMealType) {
      filtered = filtered.filter(recipe => 
        recipe.mealTypes?.some(type => type === selectedMealType)
      );
    }
    
    // Apply search text filter
    if (searchText) {
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().startsWith(searchText.toLowerCase())
      );
    }
    
    return filtered;
  }, [savedRecipes, searchText, selectedMealType]);

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const handleRecipeSelect = (recipe: RecipeDto) => {
    setSelectedRecipe(recipe);
  };

  const handleCreate = () => {
    if (selectedRecipe && selectedTime) {
      const hour = selectedTime.getHours().toString().padStart(2, '0');
      const minute = selectedTime.getMinutes().toString().padStart(2, '0');
      const hourMinString = `${hour}:${minute}`;
      onSelect(selectedRecipe, hourMinString);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedRecipe(null);
    onClose();
  };

  const renderRecipeItem = ({ item }: { item: RecipeDto }) => (
    <TouchableOpacity
      style={[
        styles.recipeItem,
        selectedRecipe?.id === item.id && styles.recipeItemSelected
      ]}
      onPress={() => handleRecipeSelect(item)}
    >
      <Image
        source={{ uri: item?.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        {item.duration && (
          <Text style={styles.recipeDuration}>
            {item.duration.value} {item.duration.unit}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>Select Recipe</Text>
          </View>

          <View style={styles.timePickerContainer}>
            <View style={styles.timePickerButton}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
                style={{ backgroundColor: 'transparent' }}
                textColor="#000"
              />
            </View>
          </View>

          <View style={styles.mealTypeContainer}>
            <View style={styles.mealTypeButtons}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === type && styles.mealTypeButtonSelected
                  ]}
                  onPress={() => setSelectedMealType(selectedMealType === type ? null : type)}
                >
                  <Text style={[
                    styles.mealTypeButtonText,
                    selectedMealType === type && styles.mealTypeButtonTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View> */}
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading recipes...</Text>
            </View>
          ) : filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText ? 'No recipes found' : 'No saved recipes available'}
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <FlatList
                data={filteredRecipes}
                renderItem={renderRecipeItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                !selectedRecipe && styles.createButtonDisabled
              ]}
              onPress={handleCreate}
              disabled={!selectedRecipe}
            >
              <Text style={styles.createButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingRight: 8,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  recipeItemSelected: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
    marginRight: 8,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recipeDuration: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    height: 120,
    overflow: 'hidden',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    height: 100,
    overflow: 'hidden',
  },
  timePickerWrapper: {
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  timePickerText: {
    marginRight: 8,
    fontSize: 16,
  },
  mealTypeContainer: {
    marginBottom: 16,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  mealTypeButtonSelected: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  mealTypeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  mealTypeButtonTextSelected: {
    color: '#FFD700',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 