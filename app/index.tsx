import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, useColorScheme, Button, Alert, Keyboard, Platform, LayoutAnimation, UIManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import AddExpenseForm from '@/components/AddExpenseForm';

// Gør det muligt at bruge LayoutAnimation på Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Forskellige imports fra react-native
export default function Index() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [expenses, setExpenses] = useState<{ id: string; title: string; price: number; description: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{ id: string; title: string; price: number; description: string } | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const colorScheme = useColorScheme();

  // Hent udgifter fra AsyncStorage, når komponenten mounter og hver gang år eller måned ændres
  useEffect(() => {
    loadExpenses();

    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [year, month]);

  // Hent udgifter fra AsyncStorage
  const loadExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem(`${year}-${month}`);
      const parsedData = data ? JSON.parse(data) : [];
      setExpenses(parsedData);
      calculateTotal(parsedData);
    } catch (error) {
      console.error('Fejl ved at loade udgifter', error);
    }
  };

  // Beregn totalen for alle udgifter
  const calculateTotal = (expenses: { id: string; title: string; price: number; description: string }[]) => {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.price, 0);
    setTotal(totalAmount);
  };

  // Tilføj en ny udgift
  const handleAddExpense = (expense: { id: string; title: string; price: number; description: string }) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpenses = [...expenses, expense];
    setExpenses(newExpenses);
    calculateTotal(newExpenses);
    AsyncStorage.setItem(`${year}-${month}`, JSON.stringify(newExpenses));
  };

  // Vælg en udgift og vis den i modalen
  const handleSelectExpense = (expense: { id: string; title: string; price: number; description: string }) => {
    setSelectedExpense(expense);
    setIsAddingExpense(false);
    setModalVisible(true);
  };

  // Slet en udgift
  const handleDeleteExpense = () => {
    if (selectedExpense) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const newExpenses = expenses.filter(expense => expense.id !== selectedExpense.id);
      setExpenses(newExpenses);
      calculateTotal(newExpenses);
      AsyncStorage.setItem(`${year}-${month}`, JSON.stringify(newExpenses));
      setModalVisible(false);
    }
  };

  // Åbn modalen til at tilføje en ny udgift
  const handleOpenAddExpenseModal = () => {
    setSelectedExpense(null);
    setIsAddingExpense(true);
    setModalVisible(true);
  };

  // Handle lukningen af modalen
  const handleCloseModal = () => {
    if (keyboardOpen) {
      Keyboard.dismiss();
    } else {
      Alert.alert(
        'Annuller tilføjelse',
        'Er du sikker på, at du vil annullere tilføjelsen af en ny udgift?',
        [
          { text: 'Nej', style: 'cancel' },
          { text: 'Ja', onPress: () => setModalVisible(false) },
        ],
        { cancelable: true }
      );
    }
  };

  // Map over årstal fra i år og 10 år tilbage
  const yearOptions = [...Array(10)].map((_, i) => ({
    label: `${new Date().getFullYear() - i}`,
    value: new Date().getFullYear() - i,
  }));

  // Månederne i stedet for tal i pickeren
  const monthOptions = [
    { label: 'Januar', value: 1 },
    { label: 'Februar', value: 2 },
    { label: 'Marts', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Maj', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  // Vælg farver alt efter om brugeren har valgt dark mode eller light mode på sin enhed
  const styles = colorScheme === 'dark' ? darkStyles : lightStyles;
  const pickerStyles = colorScheme === 'dark' ? darkPickerSelectStyles : lightPickerSelectStyles;

  // Selve applikationen
  return (
    <View style={styles.container}>
      {/* Header med år og måned pickere */}
      <View style={styles.header}>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setYear(value)}
            items={yearOptions}
            style={pickerStyles}
            value={year}
            useNativeAndroidPickerStyle={false}
            placeholder={{ label: "Vælg et årstal", value: null }}
          />
        </View>
        <View style={styles.pickerContainer}>
          <RNPickerSelect
            onValueChange={(value) => setMonth(value)}
            items={monthOptions}
            style={pickerStyles}
            value={month}
            useNativeAndroidPickerStyle={false}
            placeholder={{ label: "Vælg et måned", value: null }}
          />
        </View>
      </View>
      {/* Total udgifter */}
      <Text style={styles.totalText}>Total: {total} <Text style={styles.currencyText}>kr</Text></Text>
      {/* Liste over udgifter */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectExpense(item)} style={styles.expenseItem}>
            <Text style={styles.expenseText}>{item.title}: {item.price} <Text style={styles.currencyText}>kr</Text></Text>
          </TouchableOpacity>
        )}
      />
      {/* Knappen til at tilføje en ny udgift */}
      <TouchableOpacity style={styles.addButton} onPress={handleOpenAddExpenseModal}>
        <Text style={styles.addButtonText}>Tilføj Udgift</Text>
      </TouchableOpacity>
      {/* Modal til at tilføje eller vise en udgift */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalView}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, Platform.OS === 'web' && styles.modalContentWeb]}>
                {isAddingExpense ? (
                  <AddExpenseForm onAddExpense={handleAddExpense} onClose={() => setModalVisible(false)} />
                ) : (
                  selectedExpense && (
                    <>
                      <Text style={styles.titleText}>{selectedExpense.title}</Text>
                      <View style={styles.separator} />
                      <Text style={styles.priceText}>{selectedExpense.price} <Text style={styles.currencyText}>kr</Text></Text>
                      <View style={styles.separator} />
                      <Text style={styles.descriptionText}>{selectedExpense.description}</Text>
                      <View style={styles.separator} />
                      <View style={styles.buttonContainer}>
                        <Button title="Fjern Udgift" onPress={handleDeleteExpense} color={colorScheme === 'dark' ? '#222223' : '#F2F3F4'} />
                      </View>
                    </>
                  )
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Styles til komponenten afhængigt af om brugeren har valgt light mode
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F3F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222223',
    marginBottom: 16,
  },
  expenseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#222223',
    borderRadius: 5,
  },
  expenseText: {
    color: '#F2F3F4',
  },
  addButton: {
    backgroundColor: '#222223',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  addButtonText: {
    color: '#F2F3F4',
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#222223',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
  },
  modalContentWeb: {
    maxWidth: 400,
    width: '100%',
  },
  titleText: {
    color: '#F2F3F4',
    fontSize: 24,
    marginBottom: 10,
  },
  priceText: {
    color: '#F2F3F4',
    fontSize: 20,
    marginBottom: 10,
  },
  descriptionText: {
    color: '#F2F3F4',
    fontSize: 16,
    marginBottom: 10,
  },
  currencyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: '#F2F3F4',
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
});

// Styles til komponenten afhængigt af om brugeren har valgt dark mode
const darkStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#222223',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F2F3F4',
    marginBottom: 16,
  },
  expenseItem: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#F2F3F4',
    borderRadius: 5,
  },
  expenseText: {
    color: '#222223',
  },
  addButton: {
    backgroundColor: '#F2F3F4',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  addButtonText: {
    color: '#222223',
    fontSize: 16,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#F2F3F4',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'flex-start',
  },
  modalContentWeb: {
    maxWidth: 400,
    width: '100%',
  },
  titleText: {
    color: '#222223',
    fontSize: 24,
    marginBottom: 10,
  },
  priceText: {
    color: '#222223',
    fontSize: 20,
    marginBottom: 10,
  },
  descriptionText: {
    color: '#222223',
    fontSize: 16,
    marginBottom: 10,
  },
  currencyText: {
    fontSize: 14,
    opacity: 0.7,
  },
  separator: {
    height: 1,
    backgroundColor: '#222223',
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonSpacer: {
    width: 10,
  },
});

// Styles til picker select alt efter om brugeren har valgt light mode
const lightPickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0,
    backgroundColor: '#222223',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0,
    backgroundColor: '#222223',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  inputWeb: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0,
    backgroundColor: '#222223',
    textAlign: 'center',
  },
});

// styles til picker select alt efter om brugeren har valgt dark mode
const darkPickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#F2F3F4',
    borderRadius: 4,
    color: '#222223',
    paddingRight: 0,
    backgroundColor: '#F2F3F4',
    textAlign: 'center',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#222223',
    borderRadius: 4,
    color: '#F2F3F4',
    paddingRight: 0,
    backgroundColor: '#222223',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  inputWeb: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: '#F2F3F4',
    borderRadius: 4,
    color: '#222223',
    paddingRight: 0,
    backgroundColor: '#F2F3F4',
    textAlign: 'center',
  },
});