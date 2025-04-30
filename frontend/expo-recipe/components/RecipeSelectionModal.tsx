import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { api } from '../services/api';
import { RecipeDto, MealType } from '../types/recipe';
import { useAuth } from '../contexts/AuthContext';

type RecipeSelectionModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (recipe: RecipeDto) => void;
  mealType: MealType;
};

export const RecipeSelectionModal = ({ visible, onClose, onSelect, mealType }: RecipeSelectionModalProps) => {
  const [savedRecipes, setSavedRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

      console.log('Looking for meal type:', mealType);
      
      // Filter recipes by exact meal type match
      const filteredRecipes = data.filter(recipe => {
        if (!recipe.mealTypes) {
          console.log('Recipe missing mealTypes:', recipe);
          return false;
        }
        console.log('Recipe:', recipe.name, 'Meal types:', recipe.mealTypes);
        return recipe.mealTypes.includes(mealType);
      });
      
      console.log('Filtered recipes:', filteredRecipes);
      setSavedRecipes(filteredRecipes);
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

  const renderRecipeItem = ({ item }: { item: RecipeDto }) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <Image
        source={{ uri: item?.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
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
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select {mealType} Recipe</Text>
          {loading ? (
            <Text>Loading recipes...</Text>
          ) : savedRecipes.length === 0 ? (
            <Text>No saved recipes available for {mealType}</Text>
          ) : (
            <FlatList
              data={savedRecipes}
              renderItem={renderRecipeItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeDuration: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 