import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, SafeAreaView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { recipeApi } from '../../services/recipeApi';
import { RecipeDto } from '../../types/recipe';
import { MealType, MEAL_TYPES } from '../../types/constants';
import { FontAwesome } from '@expo/vector-icons';
import { calendarApi } from '@/services/calendarApi';
import { CalendarUpdateRequest, MealEvent } from '@/types/calendar';
import { API_ASSET_URL } from '@/services/config';

export default function NewMealEventScreen() {
    const { selectedDate } = useLocalSearchParams();
  
const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDto | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await recipeApi.getRecipes();
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMealEvent = async () => {
    if (!selectedMealType) {
      alert('Please select a meal type');
      return;
    }

    if (!selectedRecipe && !eventName) {
      alert('Please either select a recipe or enter an event name');
      return;
    }

    try {
      const mealEvent : MealEvent = {
        mealType: selectedMealType,
        eventName: eventName || undefined,
        recipeId: selectedRecipe?.id || ''
      };
      const calendarUpdateRequest: CalendarUpdateRequest = {
        date: selectedDate as string,
        mealEvents: [mealEvent]
      };

      // TODO: Add API call to create meal event
      await calendarApi.updateMealPlan(calendarUpdateRequest);
      router.back();
    } catch (error) {
      console.error('Error creating meal event:', error);
      alert('Failed to create meal event');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Type *</Text>
          <View style={styles.mealTypesContainer}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type && styles.mealTypeButtonSelected
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text style={[
                  styles.mealTypeText,
                  selectedMealType === type && styles.mealTypeTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recipe (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipesContainer}>
            {recipes.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={[
                  styles.recipeCard,
                  selectedRecipe?.id === recipe.id && styles.recipeCardSelected
                ]}
                onPress={() => setSelectedRecipe(recipe)}
              >
                {recipe.imageUrl && (
                  <Image
                    source={{ uri: `${API_ASSET_URL}/${recipe.imageUrl}` }}
                    style={styles.recipeImage}
                    resizeMode="cover"
                  />
                )}
                <Text style={styles.recipeName} numberOfLines={2}>
                  {recipe.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Name (Optional)</Text>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Enter event name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreateMealEvent}
          >
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  mealTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  mealTypeText: {
    fontSize: 14,
    color: '#666',
  },
  mealTypeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  recipesContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recipeCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  recipeCardSelected: {
    backgroundColor: '#E5E5EA',
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  recipeName: {
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
  },
  createButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 