import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { getStudents, deleteStudent, Student } from '@/database/db';
import i18n from '@/i18n';

export default function StudentListScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const router = useRouter();

  const loadStudents = () => {
    const data = getStudents();
    setStudents(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [])
  );

  const handleDelete = (id: number) => {
    if (Platform.OS === 'web') {
      if (window.confirm(i18n.t('confirmDelete'))) {
        deleteStudent(id);
        loadStudents();
      }
    } else {
      Alert.alert(
        i18n.t('delete'),
        i18n.t('confirmDelete'),
        [
          { text: i18n.t('cancel'), style: 'cancel' },
          {
            text: i18n.t('yes'),
            style: 'destructive',
            onPress: () => {
              deleteStudent(id);
              loadStudents();
            },
          },
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/student/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar}>
            <Text style={styles.placeholderText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.studentId}>{item.studentId}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.deleteText}>{i18n.t('delete')}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('studentListEmpty')}</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/student/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentId: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#757575',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
  },
});
