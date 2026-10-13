import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { getStudentById, addStudent, updateStudent, deleteStudent } from '@/database/db';
import i18n from '@/i18n';

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const isEditing = id !== 'new';
  const studentIdParam = parseInt(id as string, 10);

  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && !isNaN(studentIdParam)) {
      const student = getStudentById(studentIdParam);
      if (student) {
        setName(student.name);
        setStudentId(student.studentId);
        setEmail(student.email || '');
        setAvatar(student.avatar);
      }
    }
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const performSave = () => {
    if (!name.trim() || !studentId.trim()) {
      if (Platform.OS === 'web') window.alert(i18n.t('requiredFields'));
      else Alert.alert(i18n.t('error'), i18n.t('requiredFields'));
      return;
    }

    const studentIdRegex = /^B[A-Z]{2}(2[2-9]|30)\d{4}$/;
    if (!studentIdRegex.test(studentId)) {
      if (Platform.OS === 'web') window.alert(i18n.t('invalidStudentIdFormat'));
      else Alert.alert(i18n.t('error'), i18n.t('invalidStudentIdFormat'));
      return;
    }

    try {
      if (isEditing) {
        updateStudent(studentIdParam, name, studentId, email, avatar);
      } else {
        addStudent(name, studentId, email, avatar);
      }
      router.back();
    } catch (e: any) {
      if (Platform.OS === 'web') window.alert(e.message);
      else Alert.alert(i18n.t('error'), e.message);
    }
  };

  const handleSave = () => {
    if (isEditing) {
      if (Platform.OS === 'web') {
        if (window.confirm(i18n.t('confirmEdit'))) performSave();
      } else {
        Alert.alert(
          i18n.t('edit'),
          i18n.t('confirmEdit'),
          [
            { text: i18n.t('cancel'), style: 'cancel' },
            { text: i18n.t('yes'), onPress: performSave },
          ]
        );
      }
    } else {
      performSave();
    }
  };

  const handleDelete = () => {
    if (!isEditing) return;
    
    if (Platform.OS === 'web') {
      if (window.confirm(i18n.t('confirmDelete'))) {
        deleteStudent(studentIdParam);
        router.back();
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
              deleteStudent(studentIdParam);
              router.back();
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.headerTitle}>
        {isEditing ? i18n.t('studentDetails') : i18n.t('addStudent')}
      </Text>

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>{i18n.t('selectImage')}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{i18n.t('avatar')} (Link)</Text>
        <TextInput
          style={styles.input}
          value={avatar || ''}
          onChangeText={setAvatar}
          placeholder="https://..."
          autoCapitalize="none"
        />
        <Text style={{ fontSize: 12, color: '#757575', marginTop: 4 }}>Hoặc click vào ảnh tròn bên trên để upload từ máy.</Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{i18n.t('name')} *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={i18n.t('name')}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{i18n.t('studentId')} *</Text>
        <TextInput
          style={styles.input}
          value={studentId}
          onChangeText={setStudentId}
          placeholder={i18n.t('studentId')}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{i18n.t('email')}</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={i18n.t('email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>{i18n.t('save')}</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>{i18n.t('delete')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#757575',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
