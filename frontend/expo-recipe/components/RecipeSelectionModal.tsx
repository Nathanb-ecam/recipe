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
      console.log('Raw API Response:', JSON.stringify(data, null, 2));
      
      if (!Array.isArray(data)) {
        console.error('API response is not an array:', data);
        setSavedRecipes([]);
        return;
      }

      console.log('Looking for meal type:', mealType);
      console.log('Total recipes loaded:', data.length);
      
      // Log detailed information about each recipe
      data.forEach((recipe, index) => {
        console.log(`\nRecipe ${index + 1}:`);
        console.log('Name:', recipe.name);
        console.log('ID:', recipe.id);
        console.log('Meal Types:', recipe.mealTypes);
        console.log('Meal Types Type:', typeof recipe.mealTypes);
        console.log('Meal Types Array?', Array.isArray(recipe.mealTypes));
        if (Array.isArray(recipe.mealTypes)) {
          console.log('Meal Types Length:', recipe.mealTypes.length);
          recipe.mealTypes.forEach((type, i) => {
            console.log(`  Meal Type ${i + 1}:`, type);
            console.log(`  Type of meal type:`, typeof type);
            console.log(`  Trimmed:`, type.trim());
            console.log(`  Uppercase:`, type.toUpperCase());
          });
        }
      });
      
      // Filter recipes by exact meal type match
      const filteredRecipes = data.filter(recipe => {
        if (!recipe.mealTypes) {
          console.log('Recipe missing mealTypes:', recipe);
          return false;
        }
        if (!Array.isArray(recipe.mealTypes)) {
          console.log('Recipe mealTypes is not an array:', recipe.mealTypes);
          return false;
        }
        const hasMatchingType = recipe.mealTypes.some(type => {
          const match = type.trim().toUpperCase() === mealType.trim().toUpperCase();
          console.log(`Comparing "${type.trim()}" with "${mealType.trim()}": ${match}`);
          return match;
        });
        console.log(`Recipe ${recipe.name} has matching type: ${hasMatchingType}`);
        return hasMatchingType;
      });
      
      console.log('Filtered recipes count:', filteredRecipes.length);
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
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>Select {mealType} Recipe</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading recipes...</Text>
            </View>
          ) : savedRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No saved recipes available for {mealType}</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <FlatList
                data={savedRecipes}
                renderItem={renderRecipeItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
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
    height: '60%',
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
}); 