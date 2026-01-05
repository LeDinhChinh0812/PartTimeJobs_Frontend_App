import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';
import { Button } from '../components';
import { createOrUpdateProfile, getMyProfile } from '../services';
import { useAuth } from '../context';

const CreateCVScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editing State
    const [editingSection, setEditingSection] = useState(null); // 'personal', 'education', 'experience', 'skills', etc.
    const [tempData, setTempData] = useState({}); // To hold data while editing in modal

    // Full Profile Data
    const initialCVState = {
        // Personal
        fullName: '',
        jobTitle: '', // Vị trí ứng tuyển
        email: '',
        phone: '',
        website: '', // Website cá nhân
        address: '',
        dateOfBirth: '',
        bio: '', // Mục tiêu nghề nghiệp
        // Education
        educationList: [], // Changed to array for multiple education entries
        // Skills
        skills: '', // Kỹ năng chuyên môn
        interests: '', // Sở thích
        // Experience (Local)
        experience: [],
        // Certifications
        certifications: [], // Chứng chỉ
        // Awards
        awards: [], // Giải thưởng
    };

    const [cvData, setCvData] = useState({ ...initialCVState, resumeUrl: '' });

    useFocusEffect(
        React.useCallback(() => {
            loadCVData();
        }, [loadCVData])
    );

    const loadCVData = React.useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMyProfile();

            let data = { ...initialCVState };

            if (response.success && response.data) {
                const p = response.data;
                data = {
                    ...data,
                    fullName: p.fullName || user?.fullName || '',
                    email: p.email || user?.email || '',
                    phone: p.phoneNumber || '',
                    address: p.address || '',
                    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
                    bio: p.bio || '',
                    jobTitle: p.major || '', // Use major as job title initially
                    skills: p.skills ? p.skills.map(s => s.skillName).join(', ') : '',
                    resumeUrl: p.resumeUrl || '',
                };

                // Map education data
                if (p.university || p.major) {
                    data.educationList = [{
                        id: '1',
                        school: p.university || '',
                        major: p.major || '',
                        duration: p.yearOfStudy ? `${p.yearOfStudy} năm` : '',
                        gpa: p.gpa ? p.gpa.toString() : ''
                    }];
                }
            }

            // Local Data
            if (user?.userId) {
                const jsonValue = await AsyncStorage.getItem(`user_cv_${user.userId}`);
                if (jsonValue) {
                    const local = JSON.parse(jsonValue);
                    if (local.experience) data.experience = local.experience;
                    if (local.interests) data.interests = local.interests;
                    if (local.educationList) data.educationList = local.educationList;
                    if (local.certifications) data.certifications = local.certifications;
                    if (local.awards) data.awards = local.awards;
                    if (local.jobTitle) data.jobTitle = local.jobTitle;
                    if (local.website) data.website = local.website;
                }
            }

            setCvData(data);
        } catch (err) {
            console.error('Error loading CV:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleSaveCV = async () => {
        try {
            setSaving(true);
            console.log('--- SAVING CV ---');
            console.log('User ID:', user?.userId);
            console.log('Current CV Data (Experience):', JSON.stringify(cvData.experience));

            // 1. Prepare Skills List
            let skillsList = [];
            if (cvData.skills.trim()) {
                skillsList = cvData.skills.split(',').map(s => ({ skillName: s.trim() }));
            }

            // 2. Helper to format Date (DD/MM/YYYY -> YYYY-MM-DD)
            const formatDateForApi = (dateString) => {
                if (!dateString) return null;
                // Regex for DD/MM/YYYY
                const dmy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (dmy) {
                    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
                }
                return dateString;
            };

            // 3. Construct Payload - Explicitly defined to ensure email/phone/name are strictly updated
            const updatePayload = {
                fullName: cvData.fullName,
                email: cvData.email,
                phoneNumber: cvData.phone,
                address: cvData.address,
                bio: cvData.bio,
                dateOfBirth: formatDateForApi(cvData.dateOfBirth),
                skills: skillsList,
                // Map first education entry to profile fields (safe access)
                university: (cvData.educationList && cvData.educationList[0]) ? cvData.educationList[0].school || '' : '',
                major: cvData.jobTitle || ((cvData.educationList && cvData.educationList[0]) ? cvData.educationList[0].major || '' : ''),
                gpa: (cvData.educationList && cvData.educationList[0] && cvData.educationList[0].gpa) ? parseFloat(cvData.educationList[0].gpa) : null,
                yearOfStudy: null, // Deprecated in new structure
                resumeUrl: cvData.resumeUrl, // Preserve existing resumeUrl
            };

            console.log('Sending Profile Update:', JSON.stringify(updatePayload));

            const response = await createOrUpdateProfile(updatePayload);

            if (!response.success && !response.data) {
                throw new Error(response.message || 'Lưu thất bại');
            }

            // 2. Save Local Data
            // 2. Save Local Data
            if (user?.userId) {
                const localData = {
                    experience: cvData.experience || [],
                    interests: cvData.interests || '',
                    educationList: cvData.educationList || [],
                    certifications: cvData.certifications || [],
                    awards: cvData.awards || [],
                    jobTitle: cvData.jobTitle || '',
                    website: cvData.website || ''
                };
                console.log('Saving Local Data to AsyncStorage:', `user_cv_${user.userId}`, JSON.stringify(localData));
                await AsyncStorage.setItem(`user_cv_${user.userId}`, JSON.stringify(localData));

                // Verify immediate read back
                const check = await AsyncStorage.getItem(`user_cv_${user.userId}`);
                console.log('Immediate Read Back Verification:', check);
            } else {
                console.warn('User ID missing, skipping Local Save');
            }

            Alert.alert('Thành công', 'Đã lưu CV của bạn.', [
                { text: 'OK', onPress: () => { } }
            ]);

        } catch (err) {
            console.error('Error saving CV:', err);
            Alert.alert('Lỗi', 'Không thể lưu CV. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setSaving(false);
        }
    };

    const openEdit = (section) => {
        // Copy current data and ensure all arrays are initialized
        const dataCopy = {
            ...cvData,
            experience: cvData.experience || [],
            educationList: cvData.educationList || [],
            certifications: cvData.certifications || [],
            awards: cvData.awards || []
        };
        setTempData(dataCopy);
        setEditingSection(section);
    };

    const saveEdit = () => {
        setCvData({ ...tempData });
        setEditingSection(null);
    };

    const updateTempField = (field, value) => {
        setTempData(prev => ({ ...prev, [field]: value }));
    };

    // Experience Helpers for Modal
    const updateTempExperience = (id, field, value) => {
        setTempData(prev => ({
            ...prev,
            experience: prev.experience.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };
    const addTempExperience = () => {
        setTempData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now().toString(), company: '', role: '', duration: '', description: '' }]
        }));
    };
    const removeTempExperience = (id) => {
        setTempData(prev => ({
            ...prev,
            experience: prev.experience.filter(item => item.id !== id)
        }));
    };

    // Education Helpers
    const updateTempEducation = (id, field, value) => {
        setTempData(prev => ({
            ...prev,
            educationList: prev.educationList.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };
    const addTempEducation = () => {
        setTempData(prev => ({
            ...prev,
            educationList: [...prev.educationList, { id: Date.now().toString(), school: '', major: '', duration: '', gpa: '' }]
        }));
    };
    const removeTempEducation = (id) => {
        setTempData(prev => ({
            ...prev,
            educationList: prev.educationList.filter(item => item.id !== id)
        }));
    };

    // Certification Helpers
    const updateTempCertification = (id, field, value) => {
        setTempData(prev => ({
            ...prev,
            certifications: prev.certifications.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };
    const addTempCertification = () => {
        setTempData(prev => ({
            ...prev,
            certifications: [...prev.certifications, { id: Date.now().toString(), name: '', issuer: '', year: '' }]
        }));
    };
    const removeTempCertification = (id) => {
        setTempData(prev => ({
            ...prev,
            certifications: prev.certifications.filter(item => item.id !== id)
        }));
    };

    // Award Helpers
    const updateTempAward = (id, field, value) => {
        setTempData(prev => ({
            ...prev,
            awards: prev.awards.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };
    const addTempAward = () => {
        setTempData(prev => ({
            ...prev,
            awards: [...prev.awards, { id: Date.now().toString(), title: '', year: '', description: '' }]
        }));
    };
    const removeTempAward = (id) => {
        setTempData(prev => ({
            ...prev,
            awards: prev.awards.filter(item => item.id !== id)
        }));
    };



    // --- Render Sections for Visual CV --- //

    // Use Orange Theme for visual consistency with the app
    const THEME_COLOR = COLORS.primary || '#FF5722';
    const THEME_DARK = '#E64A19';
    const LIGHT_TEXT = '#FFF';

    const renderLeftColumn = () => (
        <View style={[styles.leftColumn, { backgroundColor: THEME_COLOR }]}>
            {/* Name & Job Title - NO AVATAR/PHOTO */}
            <TouchableOpacity style={styles.nameSection} onPress={() => openEdit('personal')}>
                <Text style={styles.cvName}>{cvData.fullName || 'Tên của bạn'}</Text>
                <Text style={styles.cvPosition}>{cvData.jobTitle || 'Vị trí ứng tuyển'}</Text>
            </TouchableOpacity>

            {/* Contact Info */}
            <TouchableOpacity style={styles.contactSection} onPress={() => openEdit('contact')}>
                <View style={styles.contactRow}>
                    <Ionicons name="calendar" size={12} color={LIGHT_TEXT} />
                    <Text style={styles.contactText}>{cvData.dateOfBirth || 'DD/MM/YYYY'}</Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="call" size={12} color={LIGHT_TEXT} />
                    <Text style={styles.contactText}>{cvData.phone || 'Số điện thoại'}</Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="mail" size={12} color={LIGHT_TEXT} />
                    <Text style={styles.contactText}>{cvData.email || 'Email'}</Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="globe" size={12} color={LIGHT_TEXT} />
                    <Text style={styles.contactText}>{cvData.website || 'Website'}</Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="location" size={12} color={LIGHT_TEXT} />
                    <Text style={styles.contactText}>{cvData.address || 'Địa chỉ'}</Text>
                </View>
            </TouchableOpacity>

            {/* Education */}
            <TouchableOpacity style={styles.leftSection} onPress={() => openEdit('education')}>
                <View style={[styles.sectionHeaderLeft, { backgroundColor: THEME_DARK }]}>
                    <Text style={styles.sectionTitleLeft}>Học vấn</Text>
                </View>
                <View style={styles.sectionContentLeft}>
                    {cvData.educationList && cvData.educationList.length > 0 ? (
                        cvData.educationList.map((edu, index) => (
                            <View key={edu.id || index} style={{ marginBottom: 8 }}>
                                <Text style={[styles.whiteText, { fontWeight: 'bold' }]}>{edu.major || 'Chuyên ngành'}</Text>
                                <Text style={styles.whiteText}>{edu.school || 'Trường'}</Text>
                                <Text style={styles.whiteText}>{edu.duration || ''}</Text>
                                {edu.gpa ? <Text style={styles.whiteText}>GPA: {edu.gpa}</Text> : null}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.whiteText}>Thêm học vấn...</Text>
                    )}
                </View>
            </TouchableOpacity>

            {/* Skills */}
            <TouchableOpacity style={styles.leftSection} onPress={() => openEdit('skills')}>
                <View style={[styles.sectionHeaderLeft, { backgroundColor: THEME_DARK }]}>
                    <Text style={styles.sectionTitleLeft}>Kỹ năng</Text>
                </View>
                <View style={styles.sectionContentLeft}>
                    {cvData.skills ? cvData.skills.split(',').map((s, i) => (
                        <Text key={i} style={styles.whiteText}>• {s.trim()}</Text>
                    )) : <Text style={styles.whiteText}>Thêm kỹ năng...</Text>}
                </View>
            </TouchableOpacity>

            {/* Interests */}
            <TouchableOpacity style={styles.leftSection} onPress={() => openEdit('interests')}>
                <View style={[styles.sectionHeaderLeft, { backgroundColor: THEME_DARK }]}>
                    <Text style={styles.sectionTitleLeft}>Sở thích</Text>
                </View>
                <View style={styles.sectionContentLeft}>
                    <Text style={styles.whiteText}>{cvData.interests || 'Thêm sở thích...'}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderRightColumn = () => (
        <View style={styles.rightColumn}>
            {/* Summary */}
            <TouchableOpacity style={styles.rightSection} onPress={() => openEdit('bio')}>
                <View style={styles.sectionHeaderRight}>
                    <Text style={[styles.sectionTitleRight, { backgroundColor: THEME_COLOR }]}>Mục tiêu nghề nghiệp</Text>
                    <View style={[styles.line, { backgroundColor: THEME_COLOR }]} />
                </View>
                <Text style={styles.textContent}>
                    {cvData.bio || 'Mục tiêu nghề nghiệp của bạn, bao gồm mục tiêu ngắn hạn và dài hạn...'}
                </Text>
            </TouchableOpacity>

            {/* Experience */}
            <TouchableOpacity style={styles.rightSection} onPress={() => openEdit('experience')}>
                <View style={styles.sectionHeaderRight}>
                    <Text style={[styles.sectionTitleRight, { backgroundColor: THEME_COLOR }]}>Kinh nghiệm làm việc</Text>
                    <View style={[styles.line, { backgroundColor: THEME_COLOR }]} />
                </View>
                {cvData.experience && cvData.experience.length > 0 ? (
                    cvData.experience.map((exp, index) => (
                        <View key={index} style={styles.expItem}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={[styles.jobTitle, { color: THEME_COLOR }]}>{exp.role}</Text>
                                <Text style={styles.jobDate}>{exp.duration}</Text>
                            </View>
                            <Text style={styles.companyName}>{exp.company}</Text>
                            <Text style={styles.textContent}>{exp.description || 'Mô tả công việc...'}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.placeholderText}>Chạm để thêm kinh nghiệm làm việc...</Text>
                )}
            </TouchableOpacity>

            {/* Awards / Certs Placeholders */}
            <TouchableOpacity style={styles.rightSection} onPress={() => openEdit('certifications')}>
                <View style={styles.sectionHeaderRight}>
                    <Text style={[styles.sectionTitleRight, { backgroundColor: THEME_COLOR }]}>Chứng chỉ</Text>
                    <View style={[styles.line, { backgroundColor: THEME_COLOR }]} />
                </View>
                {cvData.certifications && cvData.certifications.length > 0 ? (
                    cvData.certifications.map((cert, index) => (
                        <View key={cert.id || index} style={{ marginBottom: 8 }}>
                            <Text style={[styles.textContent, { fontWeight: 'bold' }]}>{cert.name || 'Tên chứng chỉ'}</Text>
                            <Text style={styles.textContent}>{cert.issuer || ''} {cert.year ? `(${cert.year})` : ''}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.placeholderText}>Chạm để thêm chứng chỉ...</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.rightSection} onPress={() => openEdit('awards')}>
                <View style={styles.sectionHeaderRight}>
                    <Text style={[styles.sectionTitleRight, { backgroundColor: THEME_COLOR }]}>Giải thưởng</Text>
                    <View style={[styles.line, { backgroundColor: THEME_COLOR }]} />
                </View>
                {cvData.awards && cvData.awards.length > 0 ? (
                    cvData.awards.map((award, index) => (
                        <View key={award.id || index} style={{ marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={[styles.textContent, { fontWeight: 'bold' }]}>{award.title || 'Tên giải thưởng'}</Text>
                                <Text style={styles.jobDate}>{award.year || ''}</Text>
                            </View>
                            <Text style={styles.textContent}>{award.description || ''}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.placeholderText}>Chạm để thêm giải thưởng...</Text>
                )}
            </TouchableOpacity>
        </View>
    );


    // --- EDIT MODALS --- //
    const renderEditModal = () => {
        if (!editingSection) return null;

        const renderModalContent = () => {
            const inputStyle = [styles.modalInput, { color: '#000' }]; // Ensure text is dark

            switch (editingSection) {
                case 'personal':
                case 'contact':
                    return (
                        <>
                            <Text style={styles.modalLabel}>Họ và tên</Text>
                            <TextInput style={inputStyle} value={tempData.fullName} onChangeText={v => updateTempField('fullName', v)} placeholder="Nhập họ tên" placeholderTextColor="#999" />
                            <Text style={styles.modalLabel}>Vị trí ứng tuyển</Text>
                            <TextInput style={inputStyle} value={tempData.jobTitle} onChangeText={v => updateTempField('jobTitle', v)} placeholder="Ví dụ: Kế toán viên" placeholderTextColor="#999" />
                            <Text style={styles.modalLabel}>Ngày sinh</Text>
                            <TextInput style={inputStyle} value={tempData.dateOfBirth} onChangeText={v => updateTempField('dateOfBirth', v)} placeholder="DD/MM/YYYY" placeholderTextColor="#999" />
                            <Text style={styles.modalLabel}>Email</Text>
                            <TextInput style={inputStyle} value={tempData.email} onChangeText={v => updateTempField('email', v)} placeholderTextColor="#999" />
                            <Text style={styles.modalLabel}>Số điện thoại</Text>
                            <TextInput style={inputStyle} value={tempData.phone} onChangeText={v => updateTempField('phone', v)} placeholderTextColor="#999" />
                            <Text style={styles.modalLabel}>Website</Text>
                            <TextInput style={inputStyle} value={tempData.website} onChangeText={v => updateTempField('website', v)} placeholder="Ví dụ: be.net/tenCuaBan" placeholderTextColor="#999" />
                            <Text style={styles.modalLabel}>Địa chỉ</Text>
                            <TextInput style={inputStyle} value={tempData.address} onChangeText={v => updateTempField('address', v)} placeholderTextColor="#999" />
                        </>
                    );
                case 'education':
                    return (
                        <ScrollView style={{ maxHeight: 400 }}>
                            {tempData.educationList && tempData.educationList.map((edu, i) => (
                                <View key={edu.id || i} style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.modalLabel, { color: COLORS.primary, fontWeight: 'bold', marginTop: 0 }]}>Học vấn {i + 1}</Text>
                                        <TouchableOpacity onPress={() => removeTempEducation(edu.id)}>
                                            <Text style={{ color: COLORS.error, fontSize: 12 }}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput style={inputStyle} placeholder="Trường đại học" placeholderTextColor="#999" value={edu.school} onChangeText={v => updateTempEducation(edu.id, 'school', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="Chuyên ngành" placeholderTextColor="#999" value={edu.major} onChangeText={v => updateTempEducation(edu.id, 'major', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="Thời gian (ví dụ: 2016 - 2020)" placeholderTextColor="#999" value={edu.duration} onChangeText={v => updateTempEducation(edu.id, 'duration', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="GPA" placeholderTextColor="#999" keyboardType="numeric" value={edu.gpa} onChangeText={v => updateTempEducation(edu.id, 'gpa', v)} />
                                </View>
                            ))}

                            <TouchableOpacity
                                style={{
                                    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
                                    padding: 12, alignItems: 'center', marginTop: 10, marginBottom: 20
                                }}
                                onPress={addTempEducation}
                            >
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>+ Thêm học vấn</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    );
                case 'skills':
                    return (
                        <>
                            <Text style={styles.modalLabel}>Kỹ năng (cách nhau dấu phẩy)</Text>
                            <TextInput
                                style={[inputStyle, { height: 100 }]}
                                value={tempData.skills}
                                onChangeText={v => updateTempField('skills', v)}
                                multiline
                                placeholderTextColor="#999"
                            />
                        </>
                    );
                case 'bio':
                    return (
                        <>
                            <Text style={styles.modalLabel}>Mục tiêu nghề nghiệp / Giới thiệu</Text>
                            <TextInput
                                style={[inputStyle, { height: 150 }]}
                                value={tempData.bio}
                                onChangeText={v => updateTempField('bio', v)}
                                multiline
                                placeholderTextColor="#999"
                            />
                        </>
                    );
                case 'experience':
                    return (
                        <ScrollView style={{ maxHeight: 400 }}>
                            {tempData.experience && tempData.experience.map((exp, i) => (
                                <View key={exp.id || i} style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.modalLabel, { color: COLORS.primary, fontWeight: 'bold', marginTop: 0 }]}>Công việc {i + 1}</Text>
                                        <TouchableOpacity onPress={() => removeTempExperience(exp.id)}>
                                            <Text style={{ color: COLORS.error, fontSize: 12 }}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput style={inputStyle} placeholder="Công ty" placeholderTextColor="#999" value={exp.company} onChangeText={v => updateTempExperience(exp.id, 'company', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="Vị trí" placeholderTextColor="#999" value={exp.role} onChangeText={v => updateTempExperience(exp.id, 'role', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="Thời gian" placeholderTextColor="#999" value={exp.duration} onChangeText={v => updateTempExperience(exp.id, 'duration', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={[inputStyle, { height: 60 }]} placeholder="Mô tả" placeholderTextColor="#999" multiline value={exp.description} onChangeText={v => updateTempExperience(exp.id, 'description', v)} />
                                </View>
                            ))}

                            <TouchableOpacity
                                style={{
                                    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
                                    padding: 12, alignItems: 'center', marginTop: 10, marginBottom: 20
                                }}
                                onPress={addTempExperience}
                            >
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>+ Thêm kinh nghiệm</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    );
                case 'interests':
                    return (
                        <>
                            <Text style={styles.modalLabel}>Sở thích</Text>
                            <TextInput
                                style={[inputStyle, { height: 100 }]}
                                value={tempData.interests}
                                onChangeText={v => updateTempField('interests', v)}
                                multiline
                                placeholderTextColor="#999"
                                placeholder="Ví dụ: Đọc sách, yoga, du lịch..."
                            />
                        </>
                    );
                case 'certifications':
                    return (
                        <ScrollView style={{ maxHeight: 400 }}>
                            {tempData.certifications && tempData.certifications.map((cert, i) => (
                                <View key={cert.id || i} style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.modalLabel, { color: COLORS.primary, fontWeight: 'bold', marginTop: 0 }]}>Chứng chỉ {i + 1}</Text>
                                        <TouchableOpacity onPress={() => removeTempCertification(cert.id)}>
                                            <Text style={{ color: COLORS.error, fontSize: 12 }}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput style={inputStyle} placeholder="Tên chứng chỉ" placeholderTextColor="#999" value={cert.name} onChangeText={v => updateTempCertification(cert.id, 'name', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="Tổ chức cấp" placeholderTextColor="#999" value={cert.issuer} onChangeText={v => updateTempCertification(cert.id, 'issuer', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="Năm" placeholderTextColor="#999" keyboardType="numeric" value={cert.year} onChangeText={v => updateTempCertification(cert.id, 'year', v)} />
                                </View>
                            ))}

                            <TouchableOpacity
                                style={{
                                    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
                                    padding: 12, alignItems: 'center', marginTop: 10, marginBottom: 20
                                }}
                                onPress={addTempCertification}
                            >
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>+ Thêm chứng chỉ</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    );
                case 'awards':
                    return (
                        <ScrollView style={{ maxHeight: 400 }}>
                            {tempData.awards && tempData.awards.map((award, i) => (
                                <View key={award.id || i} style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.modalLabel, { color: COLORS.primary, fontWeight: 'bold', marginTop: 0 }]}>Giải thưởng {i + 1}</Text>
                                        <TouchableOpacity onPress={() => removeTempAward(award.id)}>
                                            <Text style={{ color: COLORS.error, fontSize: 12 }}>Xóa</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TextInput style={inputStyle} placeholder="Tên giải thưởng" placeholderTextColor="#999" value={award.title} onChangeText={v => updateTempAward(award.id, 'title', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={inputStyle} placeholder="Năm" placeholderTextColor="#999" keyboardType="numeric" value={award.year} onChangeText={v => updateTempAward(award.id, 'year', v)} />
                                    <View style={{ height: 8 }} />
                                    <TextInput style={[inputStyle, { height: 60 }]} placeholder="Mô tả" placeholderTextColor="#999" multiline value={award.description} onChangeText={v => updateTempAward(award.id, 'description', v)} />
                                </View>
                            ))}

                            <TouchableOpacity
                                style={{
                                    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8,
                                    padding: 12, alignItems: 'center', marginTop: 10, marginBottom: 20
                                }}
                                onPress={addTempAward}
                            >
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>+ Thêm giải thưởng</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    );
                default:
                    return <Text>Chưa hỗ trợ chỉnh sửa mục này</Text>;
            }
        };

        return (
            <Modal visible={!!editingSection} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                            <TouchableOpacity onPress={() => setEditingSection(null)}>
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            {renderModalContent()}
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.modalSaveButton, { backgroundColor: COLORS.primary }]} onPress={saveEdit}>
                                <Text style={styles.modalSaveButtonText}>Lưu lại</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        )
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* Top Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>CV_{user?.fullName || 'Untitled'}</Text>
                    <Ionicons name="pencil" size={16} color={COLORS.gray500} style={{ marginLeft: 8 }} />
                </View>
                <View style={{ width: 24 }} />
            </View>

            {/* Green Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerText}>Chạm vào từng mục trong CV để sửa</Text>
                <TouchableOpacity>
                    <Ionicons name="close-circle" size={20} color="#4CAF50" />
                </TouchableOpacity>
            </View>

            {/* CV Visual Area */}
            <ScrollView style={styles.cvContainer} contentContainerStyle={styles.cvContent}>
                <View style={styles.cvPaper}>
                    {renderLeftColumn()}
                    {renderRightColumn()}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Bottom Actions Bar */}
            <View style={styles.bottomBar}>
                <View style={{ flex: 1 }} />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveCV}>
                    <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
            </View>

            {renderEditModal()}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    navBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.white,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
    backButton: { padding: 4 },

    banner: {
        backgroundColor: '#E8F5E9', flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', paddingVertical: 8, gap: 8,
    },
    bannerText: { color: '#2E7D32', fontWeight: '500' },

    cvContainer: { flex: 1, padding: 16 },
    cvContent: { paddingBottom: 20 }, // space for bottom bar
    cvPaper: {
        flexDirection: 'row', backgroundColor: COLORS.white,
        borderRadius: 2, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1,
        minHeight: 600,
    },

    // Left Column (Brownish Theme)
    leftColumn: {
        width: '35%', backgroundColor: '#3E2723', paddingVertical: 20, paddingHorizontal: 12,
    },
    nameSection: { alignItems: 'center', marginBottom: 20 },
    cvName: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 4 },
    cvPosition: { color: '#BCAAA4', fontSize: 12, textAlign: 'center', fontStyle: 'italic' },

    contactSection: { marginBottom: 24 },
    contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
    contactText: { color: '#D7CCC8', fontSize: 10 },

    leftSection: { marginBottom: 24 },
    sectionHeaderLeft: {
        backgroundColor: '#5D4037', paddingVertical: 4, paddingHorizontal: 8,
        borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8
    },
    sectionTitleLeft: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
    sectionContentLeft: { paddingLeft: 4 },
    whiteText: { color: '#D7CCC8', fontSize: 11, marginBottom: 2 },

    // Right Column
    rightColumn: {
        width: '65%', padding: 20, backgroundColor: COLORS.white,
    },
    rightSection: { marginBottom: 24 },
    sectionHeaderRight: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    sectionTitleRight: {
        backgroundColor: '#3E2723', color: COLORS.white, paddingVertical: 4,
        paddingHorizontal: 12, borderRadius: 12, fontSize: 12, fontWeight: 'bold',
        marginRight: 8, overflow: 'hidden'
    },
    line: { flex: 1, height: 1, backgroundColor: '#3E2723' },
    textContent: { fontSize: 12, color: '#424242', lineHeight: 18 },
    placeholderText: { fontSize: 12, color: '#9E9E9E', fontStyle: 'italic' },

    expItem: { marginBottom: 16 },
    jobTitle: { fontWeight: 'bold', fontSize: 13, color: '#3E2723' },
    companyName: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
    jobDate: { fontSize: 11, color: '#757575' },

    // Bottom Bar
    bottomBar: {
        flexDirection: 'row', backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#EEEEEE',
        paddingVertical: 10, paddingHorizontal: 20,
        position: 'absolute', bottom: 0, left: 0, right: 0,
        justifyContent: 'space-between', alignItems: 'center'
    },
    bottomAction: { alignItems: 'center', gap: 4 },
    bottomActionText: { fontSize: 11, color: COLORS.gray600 },
    saveButton: {
        backgroundColor: COLORS.accentOrange, paddingVertical: 10, paddingHorizontal: 30, borderRadius: 4,
    },
    saveButtonText: { color: COLORS.white, fontWeight: 'bold' },

    // Modal
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEEEEE'
    },
    modalTitle: { fontWeight: 'bold', fontSize: 16 },
    modalBody: { padding: 16 },
    modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
    modalLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4, marginTop: 12 },
    modalInput: {
        borderWidth: 1, borderColor: '#BDBDBD', borderRadius: 4,
        paddingHorizontal: 12, paddingVertical: 8, fontSize: 14
    },
    modalSaveButton: {
        backgroundColor: '#311B92', // Dark purple/indigo
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSaveButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CreateCVScreen;
