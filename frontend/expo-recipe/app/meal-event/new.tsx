import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MEAL_TYPES, FOOD_ORIGINS } from '../../types/constants';
import { RecipeDto, FoodOrigin } from '../../types/recipe';
import { recipeApi } from '../../services/recipeApi';
import { router, Tabs } from 'expo-router';
import { API_ASSET_URL } from '@/services/config';

type TabType = 'my' | 'saved';

export default function NewMealEventScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDto | null>(null);
  const [eventName, setEventName] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [myRecipes, setMyRecipes] = useState<RecipeDto[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrigins, setSelectedOrigins] = useState<FoodOrigin[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, [activeTab]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      if (activeTab === 'my') {
        const data = await recipeApi.getUserRecipes();
        setMyRecipes(data);
      } else {
        const data = await recipeApi.getSavedRecipes();
        setSavedRecipes(data);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFilterSelect = (origin: FoodOrigin) => {
    setSelectedOrigins(prev => 
      prev.includes(origin) 
        ? prev.filter(o => o !== origin)
        : [...prev, origin]
    );
  };

  const filteredRecipes = (activeTab === 'my' ? myRecipes : savedRecipes).filter(recipe => 
    selectedOrigins.length === 0 || 
    recipe.foodOrigins?.some(origin => selectedOrigins.includes(origin))
  );

  const handleCreateMealEvent = async () => {
    if (!selectedMealType || (!selectedRecipe && !eventName)) {
      alert('Please select meal type and either a recipe or enter an event name');
      return;
    }

    try {
      // TODO: Implement meal event creation with date and time
      router.back();
    } catch (error) {
      console.error('Error creating meal event:', error);
      alert('Failed to create meal event');
    }
  };

  return (
    <>
    <Tabs.Screen options={{
        title: 'Plan a Meal',        
    }} />
        <SafeAreaView style={styles.container}>

        <ScrollView style={styles.content}>
            <View style={styles.formGroup}>
            <Text style={styles.label}>Date and Time *</Text>
            <TouchableOpacity
                style={styles.dateTimeSelector}
                onPress={() => setShowDatePicker(true)}
            >
                <Text style={styles.dateTimeText}>{formatDateTime(selectedDate)}</Text>
                <FontAwesome name="calendar" size={20} color="#666" />
            </TouchableOpacity>
            </View>

            {showDatePicker && (
            <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
            />
            )}

            <View style={styles.formGroup}>
            <Text style={styles.label}>Meal Type *</Text>
            <View style={styles.mealTypeButtons}>
                {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                    key={type}
                    style={[
                    styles.mealTypeButton,
                    selectedMealType === type && styles.selectedMealTypeButton
                    ]}
                    onPress={() => setSelectedMealType(type)}
                >
                    <Text style={[
                    styles.mealTypeButtonText,
                    selectedMealType === type && styles.selectedMealTypeButtonText
                    ]}>
                    {type}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>
            </View>

            <View style={styles.formGroup}>
            <Text style={styles.label}>Event Name</Text>
            <TextInput
                style={styles.input}
                value={eventName}
                onChangeText={setEventName}
                placeholder="Enter event name (optional if selecting a recipe)"
            />
            </View>

            <View style={styles.formGroup}>
            <Text style={styles.label}>Or Select a Recipe</Text>
            <View style={styles.tabNavigation}>
                <TouchableOpacity
                style={[styles.tab, activeTab === 'my' && styles.activeTab]}
                onPress={() => setActiveTab('my')}
                >
                <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>
                    My Recipes
                </Text>
                </TouchableOpacity>
                <TouchableOpacity
                style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
                onPress={() => setActiveTab('saved')}
                >
                <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
                    Saved Recipes
                </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
                >
                <FontAwesome name="filter" size={20} color="#666" />
                <Text style={styles.filterButtonText}>Filter</Text>
                </TouchableOpacity>
                {selectedOrigins.length > 0 && (
                <View style={styles.selectedFilters}>
                    {selectedOrigins.map((origin) => (
                    <View key={origin} style={styles.filterTag}>
                        <Text style={styles.filterTagText}>{origin}</Text>
                        <TouchableOpacity
                        onPress={() => handleFilterSelect(origin)}
                        style={styles.filterTagRemove}
                        >
                        <FontAwesome name="times" size={12} color="#666" />
                        </TouchableOpacity>
                    </View>
                    ))}
                </View>
                )}
            </View>

            <ScrollView style={styles.recipeList}>
                {filteredRecipes.map((recipe) => (
                <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() => setSelectedRecipe(recipe)}
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
                ))}
            </ScrollView>
            </View>
        </ScrollView>

        <View style={styles.footer}>
            <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateMealEvent}
            >
            <Text style={styles.createButtonText}>Create Meal Event</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    </>
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
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedMealTypeButton: {
    backgroundColor: '#FFD700',
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedMealTypeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: '600',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    marginLeft: 8,
    color: '#666',
  },
  selectedFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterTagText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  filterTagRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeList: {
    maxHeight: 400,
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  createButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 