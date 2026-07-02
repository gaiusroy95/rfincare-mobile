import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Select from '@/src/components/Select';
import { colors } from '@/src/theme';
import { leadService } from '@/src/services/leadService';
import {
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  HABIT_FREQUENCY_OPTIONS,
  INCOME_RANGE_OPTIONS,
  OCCUPATION_OPTIONS,
  YES_NO_OPTIONS,
} from '@/src/constants/marketplaceLeadFlow';
import type { MarketplaceProfile } from '@/src/utils/marketplaceLeadSession';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1).padStart(2, '0'), label: String(i + 1) }));
const MONTHS = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => ({ value: String(CURRENT_YEAR - 18 - i), label: String(CURRENT_YEAR - 18 - i) }));

type Props = {
  visible: boolean;
  onClose: () => void;
  onComplete: (profile: MarketplaceProfile) => void;
  marketplaceType: 'insurance' | 'mutual_funds' | 'credit_card' | 'post_office';
  productLabel?: string;
  productCategory?: string;
  productSegment?: string | null;
};

export default function MarketplaceLeadWizard({
  visible,
  onClose,
  onComplete,
  marketplaceType,
  productLabel,
  productCategory,
  productSegment,
}: Props) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSettings, setOtpSettings] = useState({ requireMobileOtp: true, requireEmailOtp: true });
  const submittingRef = useRef(false);

  const [gender, setGender] = useState('male');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [consent, setConsent] = useState(false);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);

  const [occupation, setOccupation] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [education, setEducation] = useState('');
  const [tobaccoUse, setTobaccoUse] = useState('');
  const [tobaccoFrequency, setTobaccoFrequency] = useState('');
  const [alcoholUse, setAlcoholUse] = useState('');
  const [alcoholFrequency, setAlcoholFrequency] = useState('');

  const isShortLeadFlow = marketplaceType === 'credit_card' || marketplaceType === 'post_office';
  const loanType = marketplaceType === 'mutual_funds'
    ? 'mutual_funds'
    : marketplaceType === 'credit_card'
      ? 'credit_card'
      : marketplaceType === 'post_office'
        ? 'post_office'
        : 'insurance';
  const finalProfileStep = isShortLeadFlow ? 3 : 4;
  const wizardStepCount = isShortLeadFlow ? 4 : 5;
  const dateOfBirth = dobDay && dobMonth && dobYear ? `${dobYear}-${dobMonth}-${dobDay}` : '';
  const normalizedPhone = () => phone.replace(/\D/g, '').slice(-10);

  useEffect(() => {
    if (!visible) return;
    leadService.getOtpSettings().then(setOtpSettings).catch(() => {});
    setStep(0);
    setError('');
    setOtpSent(false);
    setLoading(false);
  }, [visible]);

  const validateContact = () => {
    if (!fullName.trim()) return 'Your name is required.';
    if (!email.trim() || !EMAIL_RE.test(email.trim())) return 'Enter a valid email address.';
    if (!normalizedPhone() || !/^[6-9]\d{9}$/.test(normalizedPhone())) return 'Enter a valid 10-digit mobile number.';
    if (!dateOfBirth) return 'Please select your complete date of birth.';
    if (!consent) return 'Please accept the consent to continue.';
    return null;
  };

  const handleSendOtp = async () => {
    setError('');
    const validationError = validateContact();
    if (validationError) { setError(validationError); return; }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const res = await leadService.startVerification({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: normalizedPhone(),
        loanType,
        source: `${marketplaceType}_marketplace`,
        consentAccepted: true,
      });
      setLeadId(res?.lead?.id || res?.id || null);
      setOtpSent(true);
      setMobileOtp('');
      setEmailOtp('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not send OTP';
      setError(message);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otpSettings.requireMobileOtp && mobileOtp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your mobile.');
      return;
    }
    if (otpSettings.requireEmailOtp && emailOtp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await leadService.verifyOtp({
        phone: normalizedPhone(),
        email: email.trim(),
        mobileOtp: otpSettings.requireMobileOtp ? mobileOtp : undefined,
        emailOtp: otpSettings.requireEmailOtp ? emailOtp : undefined,
        leadId: leadId || undefined,
      });
      setLeadId(res?.lead?.id || leadId);
      setStep(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    const profile: MarketplaceProfile = {
      leadId: leadId || undefined,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: normalizedPhone(),
      gender,
      dateOfBirth,
      occupation,
      annualIncome,
      education,
      tobaccoUse,
      tobaccoFrequency: tobaccoUse === 'yes' ? tobaccoFrequency : null,
      alcoholUse,
      alcoholFrequency: alcoholUse === 'yes' ? alcoholFrequency : null,
      productCategory,
      productSegment,
      productLabel,
      marketplaceType,
      verifiedAt: Date.now(),
    };
    if (leadId) {
      try {
        await leadService.updateLead(leadId, {
          eligibilityData: { ...profile },
          status: 'profile_complete',
        });
      } catch { /* session still works */ }
    }
    onComplete(profile);
  };

  const handleNext = async () => {
    setError('');
    if (step === 1 && !occupation) { setError('Please choose your occupation type.'); return; }
    if (step === 2 && !annualIncome) { setError('Please select your annual income range.'); return; }
    if (step === 3 && !education) { setError('Please select your educational qualification.'); return; }
    if (step === 3 && isShortLeadFlow) {
      setLoading(true);
      await finish();
      setLoading(false);
      return;
    }
    if (step === 4) {
      if (!tobaccoUse || !alcoholUse) { setError('Please answer both health habit questions.'); return; }
      if (tobaccoUse === 'yes' && !tobaccoFrequency) { setError('Please select tobacco frequency.'); return; }
      if (alcoholUse === 'yes' && !alcoholFrequency) { setError('Please select alcohol frequency.'); return; }
      setLoading(true);
      await finish();
      setLoading(false);
      return;
    }
    setStep((s) => s + 1);
  };

  const renderChoices = (
    options: { value: string; label: string }[],
    value: string,
    onChange: (v: string) => void,
    columns = 2,
  ) => (
    <View style={[styles.choiceGrid, columns === 3 && styles.choiceGrid3]}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.choiceBtn, value === opt.value && styles.choiceBtnActive, columns === 3 && styles.choiceBtn3]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.choiceText, value === opt.value && styles.choiceTextActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRadioList = (
    options: { value: string; label: string }[],
    value: string,
    onChange: (v: string) => void,
  ) => (
    <View style={styles.radioList}>
      {options.map((opt) => (
        <TouchableOpacity key={opt.value} style={styles.radioRow} onPress={() => onChange(opt.value)}>
          <View style={[styles.radioOuter, value === opt.value && styles.radioOuterActive]}>
            {value === opt.value ? <View style={styles.radioInner} /> : null}
          </View>
          <Text style={styles.radioLabel}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const stepTitles = [
    marketplaceType === 'mutual_funds'
      ? 'Start investing with personalised recommendations'
      : marketplaceType === 'post_office'
        ? 'Apply for your post office scheme'
        : marketplaceType === 'credit_card'
          ? 'Apply for your credit card'
          : '₹1 Crore life cover from ₹400/month⁺',
    'Please choose your occupation type',
    'Select your annual income',
    'Select Educational Qualification',
    'Health habits',
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSub}>{productLabel ? `Selected: ${productLabel}` : 'Personalise your quotes'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step > 0 ? (
            <Text style={styles.hint}>Just answer {wizardStepCount - step} simple question{wizardStepCount - step === 1 ? '' : 's'} to continue</Text>
          ) : null}

          <Text style={styles.title}>{stepTitles[step]}</Text>

          {step === 0 && (
            <View style={styles.section}>
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.genderBtn, gender === g.value && styles.genderBtnActive]}
                    onPress={() => setGender(g.value)}
                  >
                    <Text style={[styles.genderText, gender === g.value && styles.genderTextActive]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Your Name" value={fullName} onChangeText={setFullName} editable={!otpSent} />
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <View style={styles.dobRow}>
                <View style={styles.dobCol}><Select label="Day" value={dobDay} options={DAYS} onChange={setDobDay} placeholder="DD" /></View>
                <View style={styles.dobCol}><Select label="Month" value={dobMonth} options={MONTHS} onChange={setDobMonth} placeholder="MM" /></View>
                <View style={styles.dobCol}><Select label="Year" value={dobYear} options={YEARS} onChange={setDobYear} placeholder="YYYY" /></View>
              </View>
              <Input label="Mobile (+91)" value={phone} onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))} keyboardType="phone-pad" maxLength={10} editable={!otpSent} />
              <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!otpSent} />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>I agree to Privacy Policy & Terms</Text>
                <Switch value={consent} onValueChange={setConsent} />
              </View>
              {otpSent && (
                <View style={styles.otpBox}>
                  {otpSettings.requireMobileOtp ? <Input label="Mobile OTP" value={mobileOtp} onChangeText={(v) => setMobileOtp(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} /> : null}
                  {otpSettings.requireEmailOtp ? <Input label="Email OTP" value={emailOtp} onChangeText={(v) => setEmailOtp(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} /> : null}
                </View>
              )}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Get updates on WhatsApp</Text>
                <Switch value={whatsappUpdates} onValueChange={setWhatsappUpdates} />
              </View>
            </View>
          )}

          {step === 1 && renderChoices(OCCUPATION_OPTIONS, occupation, setOccupation, 3)}
          {step === 2 && renderRadioList(INCOME_RANGE_OPTIONS, annualIncome, setAnnualIncome)}
          {step === 3 && renderRadioList(EDUCATION_OPTIONS, education, setEducation)}
          {step === 4 && !isShortLeadFlow && (
            <View style={styles.section}>
              <Text style={styles.question}>Do you smoke or chew tobacco?</Text>
              <Text style={styles.infoBox}>Select &apos;No&apos; if you haven&apos;t used tobacco in the last 12 months.</Text>
              {renderChoices(YES_NO_OPTIONS, tobaccoUse, setTobaccoUse, 2)}
              {tobaccoUse === 'yes' ? (
                <>
                  <Text style={styles.subQuestion}>How often?</Text>
                  {renderChoices(HABIT_FREQUENCY_OPTIONS, tobaccoFrequency, setTobaccoFrequency, 3)}
                </>
              ) : null}
              <Text style={[styles.question, { marginTop: 16 }]}>Do you consume alcohol?</Text>
              {renderChoices(YES_NO_OPTIONS, alcoholUse, setAlcoholUse, 2)}
              {alcoholUse === 'yes' ? (
                <>
                  <Text style={styles.subQuestion}>How often?</Text>
                  {renderChoices(HABIT_FREQUENCY_OPTIONS, alcoholFrequency, setAlcoholFrequency, 3)}
                </>
              ) : null}
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.footer}>
            {step > 0 ? (
              <Button title="Previous" variant="ghost" onPress={() => setStep((s) => Math.max(1, s - 1))} />
            ) : <View />}
            {step > 0 && (
              <View style={styles.dots}>
                {Array.from({ length: wizardStepCount - 1 }, (_, i) => i + 1).map((i) => (
                  <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
                ))}
              </View>
            )}
            {step === 0 ? (
              !otpSent ? (
                <Button title={loading ? 'Sending…' : isShortLeadFlow ? 'Continue' : 'View Plans'} variant="customer" onPress={handleSendOtp} disabled={loading} />
              ) : (
                <Button title={loading ? 'Verifying…' : 'Verify OTP'} variant="customer" onPress={handleVerifyOtp} disabled={loading} />
              )
            ) : (
              <Button title={loading ? 'Saving…' : step === finalProfileStep ? (isShortLeadFlow ? 'Apply Now' : 'Show Plans') : 'Continue'} variant="customer" onPress={handleNext} disabled={loading} />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerSub: { fontSize: 12, color: colors.mutedForeground, flex: 1, marginRight: 8 },
  body: { padding: 20, paddingBottom: 40 },
  hint: { textAlign: 'center', fontSize: 12, color: colors.mutedForeground, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, borderStyle: 'dashed', paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.foreground, textAlign: 'center', marginBottom: 20 },
  section: { gap: 12 },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: colors.customer, borderColor: colors.customer },
  genderText: { fontWeight: '700', color: colors.mutedForeground },
  genderTextActive: { color: '#fff' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 },
  dobRow: { flexDirection: 'row', gap: 8 },
  dobCol: { flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  switchLabel: { flex: 1, fontSize: 13, color: colors.mutedForeground, marginRight: 8 },
  otpBox: { backgroundColor: colors.muted, borderRadius: 12, padding: 12, gap: 8 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choiceGrid3: {},
  choiceBtn: { width: '48%', paddingVertical: 16, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center' },
  choiceBtn3: { width: '31%' },
  choiceBtnActive: { borderColor: colors.customer, backgroundColor: `${colors.customer}10` },
  choiceText: { fontWeight: '700', fontSize: 13, color: colors.foreground, textAlign: 'center' },
  choiceTextActive: { color: colors.customer },
  radioList: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
  radioRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.customer, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: colors.customer },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.customer },
  radioLabel: { fontSize: 14, fontWeight: '600', color: colors.foreground, flex: 1 },
  question: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subQuestion: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginVertical: 8 },
  infoBox: { fontSize: 12, color: colors.mutedForeground, backgroundColor: '#EFF6FF', padding: 10, borderRadius: 8, textAlign: 'center', marginBottom: 8 },
  error: { color: '#DC2626', fontSize: 13, marginTop: 8, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, gap: 8 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.customer },
});
