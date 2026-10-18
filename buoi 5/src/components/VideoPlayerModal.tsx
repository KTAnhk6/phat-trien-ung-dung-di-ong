import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  visible: boolean;
  videoUrl: string;
  courseTitle: string;
  onClose: () => void;
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export const VideoPlayerModal: React.FC<Props> = ({
  visible,
  videoUrl,
  courseTitle,
  onClose,
}) => {
  if (!visible) return null;

  const isWeb = Platform.OS === 'web';
  const youtubeId = extractYouTubeId(videoUrl);
  const isDirectVideo = !youtubeId && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.includes('.mp4'));

  const handleOpenExternal = async () => {
    try {
      const canOpen = await Linking.canOpenURL(videoUrl);
      if (canOpen) {
        await Linking.openURL(videoUrl);
      }
    } catch (err) {
      console.warn('Không thể mở liên kết:', err);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerBadge}>TRAILER</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {courseTitle}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Video Container */}
          <View style={styles.playerContainer}>
            {isWeb ? (
              youtubeId ? (
                <iframe
                  title="YouTube Trailer"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isDirectVideo || videoUrl.startsWith('http') ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000000',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>URL trailer không hợp lệ</Text>
                </View>
              )
            ) : (
              // Native fallback or webview
              <View style={styles.nativeFallback}>
                <Text style={styles.nativeIcon}>🎬</Text>
                <Text style={styles.nativeTitle}>Sẵn sàng phát trailer</Text>
                <Text style={styles.nativeUrl} numberOfLines={2}>
                  {videoUrl}
                </Text>
                <TouchableOpacity
                  style={styles.openExternalBtn}
                  onPress={handleOpenExternal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.openExternalText}>▶️ Mở video trực tiếp</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer with external open option */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleOpenExternal}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText} numberOfLines={1}>
                🔗 Mở liên kết nguồn ngoài ({videoUrl})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const maxPlayerWidth = Math.min(width - 32, 700);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: maxPlayerWidth,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  headerTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  headerBadge: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  nativeFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  nativeIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  nativeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  nativeUrl: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  openExternalBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  openExternalText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
  },
  linkButton: {
    paddingVertical: 4,
  },
  linkText: {
    color: '#94A3B8',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
