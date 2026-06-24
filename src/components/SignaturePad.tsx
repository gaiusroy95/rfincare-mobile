import React, { useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';

type Props = {
  onSignature: (base64: string) => void;
  label?: string;
};

export default function SignaturePad({ onSignature, label = 'Draw your signature' }: Props) {
  const ref = useRef<React.ElementRef<typeof SignatureCanvas>>(null);

  const handleOK = (sig: string) => {
    onSignature(sig);
  };

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const style = `.m-signature-pad { box-shadow: none; border: none; }
    .m-signature-pad--body { border: 1px solid ${colors.border}; border-radius: 8px; }
    .m-signature-pad--footer { display: none; }`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.canvas}>
        <SignatureCanvas
          ref={ref}
          onOK={handleOK}
          descriptionText=""
          clearText="Clear"
          confirmText="Save"
          webStyle={style}
          autoClear={false}
          imageType="image/png"
        />
      </View>
      <View style={styles.actions}>
        <Button title="Clear" variant="outline" onPress={handleClear} style={styles.btn} />
        <Button
          title="Save signature"
          variant="customer"
          onPress={() => ref.current?.readSignature()}
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 8 },
  canvas: { height: 200, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { flex: 1 },
});
