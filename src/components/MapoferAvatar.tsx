import { StyleSheet, Text, View } from 'react-native';

import { MapoferMood } from '@/domain/mapofer';
import { colors } from '@/theme/colors';

type Props = {
  mood: MapoferMood;
};

export function MapoferAvatar({ mood }: Props) {
  const tired = mood === 'cansado' || mood === 'hecho-polvo';

  return (
    <View style={styles.stage}>
      <View style={styles.glow} />
      <View style={styles.character}>
        <View style={styles.head}>
          <View style={styles.hair} />
          <View style={styles.earLeft} />
          <View style={styles.earRight} />
          <View style={styles.eyesRow}>
            <View style={[styles.eye, tired && styles.tiredEye]}>
              <View style={styles.pupil} />
            </View>
            <View style={[styles.eye, tired && styles.tiredEye]}>
              <View style={styles.pupil} />
            </View>
          </View>
          <View style={styles.noseRing} />
          <View style={styles.beard} />
          <View style={styles.mouth} />
        </View>
        <View style={styles.neck} />
        <View style={styles.body}>
          <Text style={styles.shirtLogo}>POUFER</Text>
          <View style={styles.crossbody} />
          <View style={styles.bag}>
            <Text style={styles.bagText}>MF</Text>
          </View>
        </View>
      </View>
      <Text style={styles.caption}>Mapofer · sin gafas para ver los estados de los ojos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    height: 330,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#321b58',
    opacity: 0.8,
  },
  character: {
    alignItems: 'center',
    zIndex: 2,
  },
  head: {
    width: 150,
    height: 150,
    borderRadius: 58,
    backgroundColor: '#d7a174',
    borderWidth: 4,
    borderColor: '#160d24',
    position: 'relative',
    zIndex: 3,
  },
  hair: {
    position: 'absolute',
    top: -4,
    left: 4,
    width: 134,
    height: 52,
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 38,
    backgroundColor: '#17121d',
    transform: [{ rotate: '-3deg' }],
  },
  earLeft: {
    position: 'absolute',
    left: -9,
    top: 64,
    width: 18,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#c78f67',
  },
  earRight: {
    position: 'absolute',
    right: -9,
    top: 64,
    width: 18,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#c78f67',
  },
  eyesRow: {
    position: 'absolute',
    top: 61,
    left: 31,
    right: 31,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eye: {
    width: 31,
    height: 20,
    borderRadius: 14,
    backgroundColor: '#f7f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiredEye: {
    height: 12,
  },
  pupil: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#17121d',
  },
  noseRing: {
    position: 'absolute',
    top: 87,
    left: 72,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d9d7df',
  },
  beard: {
    position: 'absolute',
    left: 45,
    bottom: 19,
    width: 60,
    height: 23,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: '#39282a',
    opacity: 0.9,
  },
  mouth: {
    position: 'absolute',
    bottom: 31,
    left: 65,
    width: 24,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#6f3e3d',
    zIndex: 2,
  },
  neck: {
    width: 51,
    height: 31,
    marginTop: -10,
    backgroundColor: '#c89169',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#160d24',
  },
  body: {
    width: 184,
    height: 118,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#111016',
    borderWidth: 4,
    borderColor: '#160d24',
    position: 'relative',
    overflow: 'hidden',
  },
  shirtLogo: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    color: '#f7f3ff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  crossbody: {
    position: 'absolute',
    width: 230,
    height: 17,
    backgroundColor: '#2d2a32',
    top: 42,
    left: -25,
    transform: [{ rotate: '25deg' }],
  },
  bag: {
    position: 'absolute',
    right: 22,
    bottom: 19,
    width: 65,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#28252c',
    borderWidth: 2,
    borderColor: '#625b69',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagText: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 11,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 10,
  },
});
