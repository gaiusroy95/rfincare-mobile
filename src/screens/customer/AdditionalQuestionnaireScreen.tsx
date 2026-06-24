import React, { useEffect, useState } from 'react';

import { Text, StyleSheet, Alert } from 'react-native';

import { router } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import Screen from '@/src/components/Screen';

import Input from '@/src/components/Input';

import Button from '@/src/components/Button';

import Card from '@/src/components/Card';

import Checkbox from '@/src/components/Checkbox';

import Select from '@/src/components/Select';

import ProgressIndicator from '@/src/components/ProgressIndicator';

import { colors } from '@/src/theme';

import { apiClient } from '@/src/api/apiClient';

import { QUESTIONNAIRE_SECTIONS, type QuestionDef } from '@/src/constants/questionnaireSections';



const STEPS = QUESTIONNAIRE_SECTIONS.map((s) => ({ id: s.id, label: s.title }));

const DRAFT_KEY = 'additional_questionnaire_draft';



export default function AdditionalQuestionnaireScreen() {

  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [appId, setAppId] = useState('');

  const [submitting, setSubmitting] = useState(false);



  const section = QUESTIONNAIRE_SECTIONS[step];



  useEffect(() => {

    (async () => {

      try {

        const saved = await AsyncStorage.getItem(DRAFT_KEY);

        if (saved) setAnswers(JSON.parse(saved));

        const res = await apiClient.get('/loan-applications/me');

        const apps = Array.isArray(res.data) ? res.data : res.data?.data || [];

        const active = apps[0];

        if (active?.id) setAppId(active.id);

      } catch { /* */ }

    })();

  }, []);



  useEffect(() => {

    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(answers)).catch(() => {});

  }, [answers]);



  const setAnswer = (id: string, value: string) => {

    setAnswers((a) => ({ ...a, [id]: value }));

    if (errors[id]) setErrors((e) => { const n = { ...e }; delete n[id]; return n; });

  };



  const validateSection = () => {

    const errs: Record<string, string> = {};

    section.questions.forEach((q) => {

      if (!q.required) return;

      const v = answers[q.id];

      if (q.type === 'checkbox') {

        if (v !== 'true') errs[q.id] = 'Required';

      } else if (!v?.trim()) {

        errs[q.id] = 'Required';

      }

    });

    setErrors(errs);

    return Object.keys(errs).length === 0;

  };



  const saveDraft = async () => {

    if (!appId) return;

    try {

      await apiClient.patch(`/loan-applications/${appId}`, {

        questionnaire_responses: answers,

        questionnaire_section: section.id,

      });

    } catch { /* best-effort */ }

  };



  const submit = async () => {

    if (!validateSection()) return;

    setSubmitting(true);

    try {

      if (appId) {

        await apiClient.patch(`/loan-applications/${appId}`, {

          questionnaire_responses: answers,

          questionnaire_completed: true,

        });

      }

      await AsyncStorage.removeItem(DRAFT_KEY);

      Alert.alert('Submitted', 'Questionnaire completed.', [

        { text: 'OK', onPress: () => router.push('/(customer)/documents') },

      ]);

    } catch (e) {

      Alert.alert('Error', (e as Error).message || 'Submit failed');

    }

    setSubmitting(false);

  };



  const renderQuestion = (q: QuestionDef) => {

    if (q.type === 'checkbox') {

      return (

        <Checkbox

          key={q.id}

          label={q.label}

          description={q.description}

          checked={answers[q.id] === 'true'}

          onChange={(v) => setAnswer(q.id, v ? 'true' : 'false')}

        />

      );

    }

    if (q.type === 'select' && q.options) {

      return (

        <Select

          key={q.id}

          label={q.label}

          value={answers[q.id] || ''}

          options={q.options}

          onChange={(v) => setAnswer(q.id, v)}

          error={errors[q.id]}

        />

      );

    }

    return (

      <Input

        key={q.id}

        label={q.label}

        value={answers[q.id] || ''}

        onChangeText={(v) => setAnswer(q.id, v)}

        keyboardType={q.type === 'number' ? 'numeric' : q.type === 'tel' ? 'phone-pad' : 'default'}

        error={errors[q.id]}

        placeholder={q.placeholder}

      />

    );

  };



  return (

    <Screen title={`Questionnaire — ${section.title}`}>

      <ProgressIndicator steps={STEPS} currentStep={step} />

      <Card><Text style={styles.desc}>{section.description}</Text></Card>

      {section.questions.map(renderQuestion)}

      {step < STEPS.length - 1 ? (

        <Button

          title="Next Section"

          onPress={async () => {

            if (!validateSection()) return;

            await saveDraft();

            setStep(step + 1);

          }}

          variant="customer"

        />

      ) : (

        <Button title="Submit Questionnaire" onPress={submit} variant="customer" loading={submitting} />

      )}

      {step > 0 && (

        <Button title="Back" variant="outline" onPress={() => setStep(step - 1)} style={{ marginTop: 8 }} />

      )}

    </Screen>

  );

}



const styles = StyleSheet.create({

  desc: { color: colors.mutedForeground },

});


