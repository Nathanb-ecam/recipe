import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { RecipeDto, MealType } from '../../types/recipe';
import { FontAwesome } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/LoadingSpinner';

type FilterType = {
  type: 'mealType' | 'recipeName';
  value: string;
};

const MEAL_TYPES: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER'];

export default function SavedRecipesScreen() {
  const [savedRecipes, setSavedRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<FilterType[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadSavedRecipes();
  }, [user]);

  const loadSavedRecipes = async () => {
    if (!user?.recipesIds?.length) {
      setLoading(false);
      return;
    }

    try {            
      const data = await api.getRecipesFromIds(user.recipesIds);            
      setSavedRecipes(data);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate suggestions based on search text
  useEffect(() => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }

    const newSuggestions = new Set<string>();
    
    // First add matching meal types regardless of recipes
    MEAL_TYPES.forEach(mealType => {
      if (mealType.toLowerCase().includes(searchText.toLowerCase())) {
        newSuggestions.add(mealType);
      }
    });
    
    // Then add recipe names that start with the search text
    savedRecipes.forEach(recipe => {
      if (recipe.name.toLowerCase().startsWith(searchText.toLowerCase())) {
        newSuggestions.add(recipe.name);
      }
    });

    setSuggestions(Array.from(newSuggestions));
  }, [searchText, savedRecipes]);

  const handleAddFilter = (value: string) => {
    // Find the best matching suggestion
    const matchingSuggestion = suggestions.find(suggestion => 
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    
    if (matchingSuggestion) {
      // Determine if the value is a meal type or recipe name
      const isMealType = MEAL_TYPES.some(type => type.toLowerCase() === matchingSuggestion.toLowerCase());
      const filterType = isMealType ? 'mealType' : 'recipeName';
      
      // Check if filter already exists
      if (!filters.some(f => f.type === filterType && f.value === matchingSuggestion)) {
        setFilters([...filters, { type: filterType, value: matchingSuggestion }]);
      }
    }
    setSearchText('');
    setSuggestions([]);
  };

  const handleRemoveFilter = (filterToRemove: FilterType) => {
    setFilters(filters.filter(f => f.type !== filterToRemove.type || f.value !== filterToRemove.value));
  };

  const filteredRecipes = useMemo(() => {
    return savedRecipes.filter(recipe => {
      return filters.every(filter => {
        if (filter.type === 'mealType') {
          return recipe.mealTypes.some(type => 
            type.toLowerCase() === filter.value.toLowerCase()
          );
        } else {
          return recipe.name.toLowerCase().includes(filter.value.toLowerCase());
        }
      });
    });
  }, [savedRecipes, filters]);

  const renderFilterChip = (filter: FilterType) => (
    <View style={styles.filterChipContainer}>
      <TouchableOpacity
        style={styles.filterChip}
        onPress={() => handleRemoveFilter(filter)}
      >
        <Text style={styles.filterText}>{filter.value}</Text>
        <FontAwesome name="times" size={14} color="#666" style={styles.filterIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderRecipeItem = ({ item }: { item: RecipeDto }) => (
    <TouchableOpacity style={styles.recipeCard}>
      <Image
        source={{ uri: item?.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item?.name || 'Unnamed Recipe'}</Text>        
        {item?.duration && (
          <Text style={styles.recipeDuration}>
            {item.duration.value} {item.duration.unit}
          </Text>
        )}
        {item?.description && (
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.mealTypesContainer}>
          {item?.mealTypes && item.mealTypes.map((type, index) => (
            <Text key={index} style={styles.mealType}>
              {type}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!user?.recipesIds?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No saved recipes yet</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { width: '100%' }]}>
      <View style={[styles.searchContainer, { width: '100%' }]}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={() => {
            if (searchText) {
              handleAddFilter(searchText);
              setSearchText('');
              requestAnimationFrame(() => {
                searchInputRef.current?.focus();
              });
            }
          }}
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleAddFilter(suggestion)}
              >
                <Text>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.filtersContainer, { width: '100%' }]}
      >
        {filters.map((filter, index) => (
          <View key={index} style={styles.filterChipContainer}>
            <TouchableOpacity
              style={styles.filterChip}
              onPress={() => handleRemoveFilter(filter)}
            >
              <Text style={styles.filterText}>{filter.value}</Text>
              <FontAwesome name="times" size={14} color="#666" style={styles.filterIcon} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          width: '100%',
          padding: 16,
        }}
        style={{ width: '100%' }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    zIndex: 1,
  },
  suggestionItem: {
    padding: 12,
    
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,        
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterChipContainer: {
    marginRight: 8,
    height: 40,
    justifyContent: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    marginRight: 4,
    fontSize: 14,
  },
  filterIcon: {
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'flex-start',
    width: '100%',
    alignSelf: 'stretch',
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    width: '100%',

  },
  recipeImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDuration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  mealTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  mealType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
}); 