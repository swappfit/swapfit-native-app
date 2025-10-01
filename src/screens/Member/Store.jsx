import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  StatusBar,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import Events from './Events';
import { fetchProducts } from '../../api/shopService';
import { fetchCart, addToCart, removeFromCart, updateCartItem } from '../../api/cartService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

const tabs = [
  { id: 'shop', title: 'Shop', icon: 'bag-handle' },
  { id: 'events', title: 'Events', icon: 'calendar' },
];

const categories = [
  { id: 'all', name: 'All', icon: 'storefront' },
  { id: 'supplements', name: 'Supplements', icon: 'medical' },
  { id: 'equipment', name: 'Equipment', icon: 'barbell' },
  { id: 'electronics', name: 'Electronics', icon: 'phone-portrait' },
  { id: 'clothing', name: 'Clothing', icon: 'shirt' },
  { id: 'nutrition', name: 'Nutrition', icon: 'leaf' },
];

const Store = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [likedItems, setLikedItems] = useState(new Set());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);

  // --- useEffect FOR FETCHING INITIAL DATA ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('[STORE] Loading initial data...');
        setLoading(true);
        setError(null);

        const [productsResult, cartResult] = await Promise.allSettled([
          fetchProducts(),
          fetchCart(),
        ]);
        
        if (productsResult.status === 'fulfilled') {
          const rawData = productsResult.value;
          let productArray = [];
          if (Array.isArray(rawData)) {
            productArray = rawData;
          } else if (rawData && Array.isArray(rawData.data)) {
            productArray = rawData.data;
          }
          console.log("[STORE] Successfully processed products:", productArray);
          setProducts(productArray);
        } else {
          console.error("[STORE] Error fetching products:", productsResult.reason);
          setError("Failed to load products. Please check your connection.");
        }

        if (cartResult.status === 'fulfilled') {
          console.log("[STORE] Successfully fetched cart:", cartResult.value);
          setCartItems(cartResult.value || []);
        } else {
          console.warn("[STORE] Could not fetch cart:", cartResult.reason);
          setCartItems([]);
        }

      } catch (err) {
        console.error("[STORE] Critical error in loadInitialData:", err);
        setError("An unexpected error occurred. Please restart the app.");
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'shop') {
      loadInitialData();
    }
  }, [activeTab]);

  // --- CART HANDLERS ---
  const handleAddToCart = async (product) => {
    try {
      console.log('[STORE] Adding to cart:', product);
      console.log('[STORE] Product ID:', product.id);
      
      const updatedItem = await addToCart(product.id, 1);
      console.log('[STORE] API response for addToCart:', updatedItem);
  
      setCartItems(prevItems => {
        console.log('[STORE] Previous cart items:', prevItems);
        const existingItemIndex = prevItems.findIndex(item => item.id === updatedItem.id);
  
        if (existingItemIndex > -1) {
          console.log('[STORE] Updating existing cart item');
          const newItems = [...prevItems];
          newItems[existingItemIndex] = updatedItem;
          return newItems;
        } else {
          console.log('[STORE] Adding new item to cart');
          return [...prevItems, updatedItem];
        }
      });
  
      Alert.alert('Success', `${product.name} has been added to your cart.`);
  
    } catch (apiError) {
      console.error("[STORE] Error in handleAddToCart:", apiError);
      console.error("[STORE] Error response:", apiError.response);
      
      let errorMessage = 'Please try again later.';
      if (apiError.response) {
        errorMessage = apiError.response.data?.message || apiError.response.data?.error || errorMessage;
      } else if (apiError.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = apiError.message;
      }
      
      Alert.alert('Error', `Could not add item to cart. ${errorMessage}`);
    }
  };

  const handleUpdateCartItem = async (cartItemId, newQuantity) => {
    try {
      console.log('[STORE] Updating cart item:', { cartItemId, newQuantity });
      
      if (newQuantity < 1) {
        console.log('[STORE] Quantity less than 1, removing item');
        await removeFromCart(cartItemId);
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
      } else {
        console.log('[STORE] Updating item quantity');
        const updatedItem = await updateCartItem(cartItemId, newQuantity);
        console.log('[STORE] Updated item response:', updatedItem);
        setCartItems(prevItems => 
          prevItems.map(item => item.id === cartItemId ? updatedItem : item)
        );
      }
    } catch (apiError) {
      console.error("[STORE] Error in handleUpdateCartItem:", apiError);
      console.error("[STORE] Error response:", apiError.response);
      const errorMessage = apiError.response?.data?.message || 'Please try again later.';
      Alert.alert('Error', `Could not update item. ${errorMessage}`);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
      console.log('[STORE] Removing from cart:', cartItemId);
      await removeFromCart(cartItemId);
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    } catch (apiError) {
      console.error("[STORE] Error in handleRemoveFromCart:", apiError);
      console.error("[STORE] Error response:", apiError.response);
      const errorMessage = apiError.response?.data?.message || 'Please try again later.';
      Alert.alert('Error', `Could not remove item. ${errorMessage}`);
    }
  };

  const getCartTotal = () => {
    const total = cartItems
      .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    console.log('[STORE] Calculated cart total:', total);
    return total.toLocaleString();
  };

  // --- EXISTING FUNCTIONS (UNCHANGED) ---
  const toggleLike = (productId) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) newSet.delete(productId);
      else newSet.add(productId);
      return newSet;
    });
  };

  // --- RENDER FUNCTIONS ---
  const renderProductCard = ({ item: product }) => (
    <TouchableOpacity style={[styles.productCard, { width: CARD_WIDTH }]}>
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/160' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
          style={styles.imageOverlay}
        />
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => toggleLike(product.id)}
        >
          <Icon
            name={likedItems.has(product.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={likedItems.has(product.id) ? '#FFC107' : '#aaa'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.brandText}>{product.seller?.storeName || 'GymFlex Store'}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={14} color="#FFC107" />
          <Text style={styles.ratingText}>4.7</Text>
          <Text style={styles.reviewsText}>({Math.floor(Math.random() * 2000)})</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₹{product.price.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            product.stock <= 0 && styles.outOfStockButton
          ]}
          disabled={product.stock <= 0}
          onPress={() => handleAddToCart(product)}
        >
          <View
            style={[
              styles.buttonSolidBlue,
              product.stock <= 0 && styles.outOfStockButton
            ]}
          >
            <Text style={[
              styles.addToCartText,
              product.stock <= 0 && styles.outOfStockText
            ]}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderProductList = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#FFC107" style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!products || products.length === 0) {
      return <Text style={styles.errorText}>No products found.</Text>;
    }
    return (
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderShopTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#FFC107" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#aaa"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <View style={styles.buttonSolidBlue}>
            <Icon name="options" size={20} color="white" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={styles.categoryButton}
            >
              <View
                style={[
                  styles.categorySolidBackground,
                  selectedCategory === category.id && styles.categorySelectedBackground,
                ]}
              >
                <Icon
                  name={category.icon}
                  size={24}
                  color={selectedCategory === category.id ? 'white' : '#FFC107'}
                />
                <Text
                  style={[
                    styles.categoryName,
                    { color: selectedCategory === category.id ? 'white' : '#FFC107' }
                  ]}
                >
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.productsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Products</Text>
          {!loading && !error && <Text style={styles.itemCount}>{products.length} items</Text>}
        </View>
        {renderProductList()}
      </View>
    </ScrollView>
  );

  const renderCartModal = () => (
    <Modal
      visible={isCartVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsCartVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.cartModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Cart</Text>
            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
              <Icon name="close" size={24} color="#FFC107" />
            </TouchableOpacity>
          </View>
          
          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
                <Icon name="cart-outline" size={60} color="rgba(255,255,255,0.3)" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.cartItem}>
                    <Image source={{ uri: item.product?.images?.[0] || 'https://via.placeholder.com/160' }} style={styles.cartItemImage} />
                    <View style={styles.cartItemDetails}>
                      <Text style={styles.cartItemName} numberOfLines={1}>{item.product?.name}</Text>
                      <Text style={styles.cartItemPrice}>₹{item.product?.price?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateCartItem(item.id, item.quantity - 1)}
                      >
                        <Icon name="remove" size={18} color="#FFC107" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => handleUpdateCartItem(item.id, item.quantity + 1)}
                      >
                        <Icon name="add" size={18} color="#FFC107" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveFromCart(item.id)}>
                      <Icon name="trash-outline" size={22} color="#FFa000" />
                    </TouchableOpacity>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.cartFooter}>
                  <Text style={styles.cartTotalText}>Total: ₹{getCartTotal()}</Text>
                  <TouchableOpacity style={styles.checkoutButton}>
                      <View style={styles.buttonSolidBlue}>
                         <Text style={styles.applyButtonText}>Checkout</Text>
                      </View>
                  </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: '#001f3f' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#001f3f" />
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              {activeTab === tab.id && <View style={styles.activeTabBackground} />}
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.id ? '#FFC107' : 'rgba(255,255,255,0.7)'}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#FFC107' : 'rgba(255,255,255,0.7)' }]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.cartButton} onPress={() => setIsCartVisible(true)}>
          <Icon name="cart" size={28} color="#FFC107" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'shop' && renderShopTab()}
      {activeTab === 'events' && <Events />}

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Icon name="close" size={24} color="#FFC107" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                {['Popular', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Newest'].map(
                  (option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.sortOption,
                        selectedSort === option.toLowerCase().replace(/[:\s]/g, '-') &&
                          styles.selectedSortOption,
                      ]}
                      onPress={() =>
                        setSelectedSort(option.toLowerCase().replace(/[:\s]/g, '-'))
                      }
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          selectedSort === option.toLowerCase().replace(/[:\s]/g, '-') &&
                            styles.selectedSortOptionText,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <View style={styles.buttonSolidBlue}>
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {renderCartModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#001f3f',
  },
  tabContainer: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 20,
  },
  cartButton: {
    position: 'relative',
    padding: 5,
  },
  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#FFC107',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#001f3f',
  },
  cartBadgeText: {
    color: '#001f3f',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cartModalContainer: {
    backgroundColor: '#002b5c',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    height: '60%',
  },
  emptyCartContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  emptyCartText: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.5)',
      marginTop: 16,
      fontWeight: '500',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 193, 7, 0.2)',
  },
  cartItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 16,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#FFC107',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002b5c',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  cartFooter: {
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 193, 7, 0.2)',
      marginTop: 10,
  },
  cartTotalText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'right',
      marginBottom: 16,
  },
  checkoutButton: {
      borderRadius: 16,
      overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    position: 'relative',
  },
  activeTabBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: 16,
  },
  tabIcon: {
    marginBottom: 4,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    zIndex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#001f3f',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002b5c',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  filterButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: 50,
    height: 50,
  },
  buttonSolidBlue: {
    backgroundColor: '#FFC107',
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    width: '100%',
  },
  addToCartText: {
    color: '#001f3f',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  applyButtonText: {
    color: '#001f3f',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemCount: {
    fontSize: 14,
    color: '#FFC107',
  },
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categorySolidBackground: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    minWidth: 100,
    borderRadius: 20,
    backgroundColor: '#002b5c',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  categorySelectedBackground: {
    backgroundColor: '#FFC107',
    borderColor: '#FFA000',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  productsSection: {
    marginBottom: 24,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#002b5c',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.2)',
  },
  productImageContainer: {
    position: 'relative',
    height: 160,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  likeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 16,
  },
  brandText: {
    fontSize: 12,
    color: '#FFC107',
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    lineHeight: 20,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFC107',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  addToCartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginTop: 8,
  },
  outOfStockButton: {
    backgroundColor: '#333',
    opacity: 0.7,
    width: '100%',
  },
  outOfStockText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#002b5c',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFC107',
    marginBottom: 16,
  },
  sortOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#002b5c',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSortOption: {
    backgroundColor: '#00334d',
    borderColor: '#FFC107',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#FFC107',
  },
  selectedSortOptionText: {
    color: '#FFC107',
    fontWeight: '600',
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  errorText: {
    color: '#FFa000',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
    paddingHorizontal: 20,
  },
});

export default Store;