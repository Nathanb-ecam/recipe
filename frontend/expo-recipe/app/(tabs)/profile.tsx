import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ScrollView, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { RecipeDto, FoodOrigin } from '../../types/recipe';
import { FontAwesome } from '@expo/vector-icons';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { router } from 'expo-router';
import { API_ASSET_URL } from '@/services/config';
import { FOOD_ORIGINS } from '../../types/constants';

type TabType = 'recipes' | 'saved' | 'shared';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('recipes');
  const [recipes, setRecipes] = useState<RecipeDto[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<RecipeDto[]>([]);
  const [sharedRecipes, setSharedRecipes] = useState<RecipeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeDto | null>(null);
  const [selectedOrigins, setSelectedOrigins] = useState<FoodOrigin[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  useEffect(() => {
    loadUserRecipes();
  }, []);

  const loadUserRecipes = async () => {
    try {
      setLoading(true);
      const userRecipes = await api.getUserRecipes();
      setRecipes(userRecipes);
    } catch (error) {
      console.error('Error loading user recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRecipes = async () => {
    try {
      setLoadingTab(true);
      const saved = await api.getSavedRecipes();
      setSavedRecipes(saved);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setLoadingTab(false);
    }
  };

  const loadSharedRecipes = async () => {
    try {
      setLoadingTab(true);
      const shared = await api.getSharedRecipes();
      setSharedRecipes(shared);
    } catch (error) {
      console.error('Error loading shared recipes:', error);
    } finally {
      setLoadingTab(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'saved' && savedRecipes.length === 0) {
      loadSavedRecipes();
    } else if (tab === 'shared' && sharedRecipes.length === 0) {
      loadSharedRecipes();
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipeToDelete) return;
    
    try {
      await api.deleteRecipeCreatedByUser(recipeToDelete.id);
      setRecipes(recipes.filter(r => r.id !== recipeToDelete.id));
      setShowDeleteModal(false);
      setRecipeToDelete(null);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe');
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {    
    if(recipeId.length <= 1) return;
    try {
      await api.removeRecipeIdFromSaved(recipeId);
      setSavedRecipes(savedRecipes.filter(r => r.id !== recipeId));
    } catch (error) {
      console.error('Error unsaving recipe:', error);
      alert('Failed to unsave recipe');
    }
  }

  const handleFilterSelect = (origin: FoodOrigin) => {
    setSelectedOrigins(prev => 
      prev.includes(origin) 
        ? prev.filter(o => o !== origin)
        : [...prev, origin]
    );
  };

  const filteredRecipes = recipes.filter(recipe => 
    selectedOrigins.length === 0 || 
    recipe.foodOrigins?.some(origin => selectedOrigins.includes(origin))
  );

  const filteredSavedRecipes = savedRecipes.filter(recipe => 
    selectedOrigins.length === 0 || 
    recipe.foodOrigins?.some(origin => selectedOrigins.includes(origin))
  );

  const renderRecipeItem = ({ item }: { item: RecipeDto }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.recipeSquare}
      onPress={() => router.push(`/recipe/${item.id}`)}
    >
      {item.imageUrl ? (
        <Image source={{ uri: API_ASSET_URL + item.imageUrl }} style={styles.recipeImage}/>
      ) : (
        <View style={styles.recipePlaceholder} />
      )}
      <Text style={styles.recipeName} numberOfLines={1}>
        {item.name}
      </Text>
      {activeTab === 'recipes' && (
        <TouchableOpacity
          style={styles.topRightCardAbsButton}
          onPress={() => {
            setRecipeToDelete(item);
            setShowDeleteModal(true);
          }}
        >
          <FontAwesome name="times" size={16} color="#FF3B30" />
        </TouchableOpacity>
      )}
      {activeTab === 'saved' && (
        <TouchableOpacity
          style={styles.topRightCardAbsButton}
          onPress={() => handleUnsaveRecipe(item.id)}
        >
          <FontAwesome name="heart" size={16} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loadingTab) {
      return <LoadingSpinner />;
    }

    switch (activeTab) {
      case 'recipes':
        return (
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recipeList}
          />
        );
      case 'saved':
        return (
          <FlatList
            data={filteredSavedRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recipeList}
          />
        );
      case 'shared':
        return (
          <FlatList
            data={sharedRecipes}
            renderItem={renderRecipeItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recipeList}
          />
        );
    }
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter by Cuisine</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <FontAwesome name="times" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.filterOptions}>
            {FOOD_ORIGINS.map((origin) => (
              <TouchableOpacity
                key={origin}
                style={[
                  styles.filterOption,
                  selectedOrigins.includes(origin) && styles.filterOptionSelected
                ]}
                onPress={() => handleFilterSelect(origin)}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedOrigins.includes(origin) && styles.filterOptionTextSelected
                ]}>
                  {origin}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.profilePictureContainer}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.profilePicture}
              />
            ) : (
              <FontAwesome name="user" size={40} color="#666" />
            )}
          </View>
          <Text style={styles.username}>{user?.name || 'User'}</Text>
          <Text style={styles.bio}>{user?.bio || 'No bio yet'}</Text>
        </View>

        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
            onPress={() => handleTabChange('recipes')}
          >
            <FontAwesome name="book" size={18} color={activeTab === 'recipes' ? '#FFD700' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => handleTabChange('saved')}
          >
            <FontAwesome name="heart" size={18} color={activeTab === 'saved' ? '#FFD700' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shared' && styles.activeTab]}
            onPress={() => handleTabChange('shared')}
          >
            <FontAwesome name="share" size={18} color={activeTab === 'shared' ? '#FFD700' : '#666'} />
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

        <View style={styles.content}>
          {loadingTab ? (
            <LoadingSpinner />
          ) : (
            <View style={styles.recipeGrid}>
              {activeTab === 'recipes' && filteredRecipes.map((recipe) => renderRecipeItem({ item: recipe }))}
              {activeTab === 'saved' && filteredSavedRecipes.map((recipe) => renderRecipeItem({ item: recipe }))}
              {activeTab === 'shared' && sharedRecipes.map((recipe) => renderRecipeItem({ item: recipe }))}
            </View>
          )}
        </View>

        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Recipe</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this recipe? This action cannot be undone.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteRecipe}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {renderFilterModal()}
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
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',    
  },
  tabNavigation: {    
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
  recipeList: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  recipeInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  recipeName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  recipeDescription: {
    fontSize: 12,
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 8,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-between',
    gap: 4,
    padding: 4,
  },
  recipeSquare: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 8,
    position: 'relative',
  },
  recipePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  topRightCardAbsButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 8,
    
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    padding: 4,
    paddingInline: 8,
  },  
  deleteButton: {              
    borderRadius: 4,    
  },
  deleteButtonText: {
    color: '#666',
    padding: 4,
    paddingInline: 8,
    backgroundColor: '#E5E5EA',
    fontSize: 16,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterOptionSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
}); 