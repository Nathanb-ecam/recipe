import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { RecipeDto } from '../../types/recipe';
import { API_ASSET_URL } from '@/services/config';

export default function RecipeIdeasScreen() {
  const { ingredients } = useLocalSearchParams<{ ingredients: string }>();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestions();
  }, [ingredients]);

  const getSuggestions = async () => {
    try {
      setLoading(true);
      const ingredientList = ingredients.split('\n').map(i => i.trim());
      const response = await api.getRecipeIdeas(ingredientList);
      console.log('Recipe ideas response:', response);
      
      // Check if response is a list of UUIDs
      const isUuidList = response.every((id: string) => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      );

      if (isUuidList) {
        // Fetch recipes for each UUID
        const recipeResults = await api.getRecipesFromIds(response);        
        setRecipes(recipeResults);
      } else {
        setSuggestions(response);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeCard = (recipe: RecipeDto) => (
    <TouchableOpacity
      key={recipe.id}
      style={styles.recipeCard}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={styles.recipeCardContent}>
        {recipe.imageUrl ? (
          <Image
            source={{ uri: API_ASSET_URL + recipe.imageUrl }}
            style={styles.recipeCardImage}
          />
        ) : (
          <View style={styles.recipeCardImagePlaceholder}>
            <FontAwesome name="image" size={24} color="#666" />
          </View>
        )}
        <View style={styles.recipeCardInfo}>
          <Text style={styles.recipeCardName}>{recipe.name}</Text>
          <View style={styles.recipeCardTags}>
            {recipe.foodOrigins?.map((origin) => (
              <View key={origin} style={styles.recipeCardTag}>
                <Text style={styles.recipeCardTagText}>{origin}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>      

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading suggestions...</Text>
        ) : recipes.length > 0 ? (
          recipes.map(renderRecipeCard)
        ) : suggestions.length > 0 ? (
          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noResultsText}>No suggestions found</Text>
        )}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionItem: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  recipeCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recipeCardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeCardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  recipeCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recipeCardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  recipeCardTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeCardTagText: {
    fontSize: 12,
    color: '#666',
  },
}); 