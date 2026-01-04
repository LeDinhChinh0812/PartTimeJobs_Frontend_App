import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';

const TestAPIScreen = () => {
    const [result, setResult] = useState('Chưa test');
    const [loading, setLoading] = useState(false);

    const testAPI = async () => {
        setLoading(true);
        setResult('Đang test...');

        try {
            // Test 1: Fetch to API
            console.log(`Testing API at: ${API_BASE_URL}/api/JobPosts`);

            const response = await fetch(`${API_BASE_URL}/api/JobPosts?pageNumber=1&pageSize=5`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                setResult(`✅ SUCCESS!\n\nStatus: ${response.status}\n\nData: ${JSON.stringify(data, null, 2).substring(0, 500)}...`);
            } else {
                setResult(`❌ FAILED\n\nStatus: ${response.status}\n\nResponse: ${await response.text()}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setResult(`❌ ERROR\n\nMessage: ${error.message}\n\nStack: ${error.stack}`);
        } finally {
            setLoading(false);
        }
    };

    const testLocalhost = async () => {
        setLoading(true);
        setResult('Đang test localhost...');

        try {
            const response = await fetch('http://localhost:5000/api/JobPosts?pageNumber=1&pageSize=5');

            if (response.ok) {
                const data = await response.json();
                setResult(`✅ LOCALHOST SUCCESS!\n\nData: ${JSON.stringify(data, null, 2).substring(0, 300)}`);
            } else {
                setResult(`❌ LOCALHOST FAILED\n\nStatus: ${response.status}`);
            }
        } catch (error) {
            setResult(`❌ LOCALHOST ERROR\n\n${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>API Connection Test</Text>

            <View style={styles.buttons}>
                <Button
                    title={`Test API (${API_BASE_URL})`}
                    onPress={testAPI}
                    disabled={loading}
                />
                <View style={{ height: 10 }} />
                <Button
                    title="Test Localhost"
                    onPress={testLocalhost}
                    disabled={loading}
                />
            </View>

            <ScrollView style={styles.resultContainer}>
                <Text style={styles.resultText}>{result}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttons: {
        marginBottom: 20,
    },
    resultContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
    },
    resultText: {
        fontFamily: 'monospace',
        fontSize: 12,
    },
});

export default TestAPIScreen;
