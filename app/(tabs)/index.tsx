import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

// ─── Animated Stat Card ───────────────────────────────────────────────────────
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        },
      ]}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  desc,
  accent,
  delay,
}: {
  icon: string;
  title: string;
  desc: string;
  accent: string;
  delay: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay, useNativeDriver: true, tension: 50, friction: 9 }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}
    >
      <View style={[styles.featureIconBox, { backgroundColor: accent + "18" }]}>
        <FontAwesome5 name={icon} size={22} color={accent} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </Animated.View>
  );
}

// ─── Disease Tag ──────────────────────────────────────────────────────────────
function DiseaseTag({ label, index }: { label: string; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: 800 + index * 80,
      useNativeDriver: true,
      tension: 70,
      friction: 8,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.tag,
        {
          opacity: anim,
          transform: [{ scale: anim }],
        },
      ]}
    >
      <Text style={styles.tagText}>{label}</Text>
    </Animated.View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const heroAnim = useRef(new Animated.Value(0)).current;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

  const diseases = ["Diabetes Tipo 2", "Hipertensión", "Obesidad", "Anemia", "Hipercolesterolemia"];

  const slides = [
    {
      icon: "clipboard-list",
      title: "Registro de hábitos",
      desc: "Responde un breve cuestionario sobre tu alimentación diaria.",
      color: "#34D399",
    },
    {
      icon: "chart-line",
      title: "Análisis personalizado",
      desc: "Nuestro sistema evalúa tus datos con modelos estadísticos validados.",
      color: "#60A5FA",
    },
    {
      icon: "heartbeat",
      title: "Predicción de riesgos",
      desc: "Descubre posibles enfermedades y recibe recomendaciones claras.",
      color: "#F472B6",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#060D1F" }}>
      <StatusBar barStyle="light-content" backgroundColor="#060D1F" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── HERO ── */}
        <LinearGradient
          colors={["#060D1F", "#0F2356", "#0B3D2E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: heroAnim,
                transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
              },
            ]}
          >
            <View style={styles.logoRow}>
              <View style={styles.logoDot} />
              <Text style={styles.logoText}>Ruta Vital</Text>
            </View>
            <TouchableOpacity style={styles.avatarBtn}>
              <Ionicons name="person-circle-outline" size={36} color="white" />
            </TouchableOpacity>
          </Animated.View>

          {/* Badge */}
          <Animated.View
            style={[
              styles.badge,
              {
                opacity: heroAnim,
                transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
              },
            ]}
          >
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Análisis con IA · Gratis</Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text
            style={[
              styles.heroTitle,
              {
                opacity: heroAnim,
                transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
              },
            ]}
          >
            Predice enfermedades{"\n"}
            <Text style={styles.heroAccent}>desde tus hábitos</Text>
          </Animated.Text>

          <Animated.Text
            style={[
              styles.heroSub,
              {
                opacity: heroAnim,
              },
            ]}
          >
            Análisis personalizado de tu alimentación y estilo de vida en solo 5 minutos.
          </Animated.Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard value="5+" label="Enfermedades" delay={300} />
            <StatCard value="98%" label="Precisión" delay={420} />
            <StatCard value="5min" label="Test rápido" delay={540} />
          </View>
        </LinearGradient>

        {/* ── CARRUSEL ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>¿Cómo funciona?</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.carouselWrap}>
          <Swiper
            autoplay
            autoplayTimeout={4}
            showsPagination
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
            height={210}
            onIndexChanged={setActiveSlide}
          >
            {slides.map((s, i) => (
              <View key={i} style={styles.slide}>
                <LinearGradient
                  colors={[s.color + "15", s.color + "05"]}
                  style={styles.slideGradient}
                >
                  <View style={[styles.slideIconWrap, { backgroundColor: s.color + "20" }]}>
                    <FontAwesome5 name={s.icon} size={32} color={s.color} />
                  </View>
                  <View style={[styles.stepBadge, { backgroundColor: s.color }]}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  </View>
                  <Text style={styles.slideTitle}>{s.title}</Text>
                  <Text style={styles.slideText}>{s.desc}</Text>
                </LinearGradient>
              </View>
            ))}
          </Swiper>
        </View>

        {/* ── FEATURES ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Características</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.featuresGrid}>
          <FeatureCard
            icon="shield-alt"
            title="Prevención"
            desc="Detecta riesgos antes de que aparezcan."
            accent="#34D399"
            delay={200}
          />
          <FeatureCard
            icon="brain"
            title="IA Avanzada"
            desc="Modelos estadísticos validados."
            accent="#60A5FA"
            delay={300}
          />
          <FeatureCard
            icon="apple-alt"
            title="Nutrición"
            desc="Recomendaciones para tu dieta."
            accent="#F472B6"
            delay={400}
          />
          <FeatureCard
            icon="chart-bar"
            title="Estadísticas"
            desc="Predicciones con evidencia científica."
            accent="#FBBF24"
            delay={500}
          />
        </View>

        {/* ── DISEASES ── */}
        <View style={styles.diseasesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Podemos predecir</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.tagsWrap}>
            {diseases.map((d, i) => (
              <DiseaseTag key={i} label={d} index={i} />
            ))}
          </View>
        </View>

        {/* ── ABOUT STRIP ── */}
        <View style={styles.aboutStrip}>
          <LinearGradient
            colors={["#0F2356", "#0B3D2E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.aboutGrad}
          >
            <MaterialCommunityIcons name="university" size={28} color="#34D399" />
            <Text style={styles.aboutText}>
              Desarrollado por estudiantes de la{" "}
              <Text style={styles.aboutAccent}>Universidad de Cundinamarca</Text>
              {" "}· Seccional Girardot
            </Text>
          </LinearGradient>
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaSection}>
          <TouchableOpacity activeOpacity={0.85} style={styles.ctaBtn}>
            <LinearGradient
              colors={["#34D399", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGrad}
            >
              <FontAwesome5 name="heartbeat" size={20} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.ctaText}>Comenzar análisis</Text>
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>

        {/* ── CONTACT ── */}
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={18} color="#34D399" />
            <Text style={styles.contactText}>contacto@rutavital.com</Text>
          </View>
          <View style={styles.contactDivider} />
          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={18} color="#34D399" />
            <Text style={styles.contactText}>Girardot, Cundinamarca</Text>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <Text style={styles.footer}>© 2025 Ruta Vital · Tu salud es nuestra prioridad</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060D1F",
  },

  // HERO
  hero: {
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#34D39912",
    top: -60,
    right: -60,
  },
  decorCircle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#1E3A8A20",
    bottom: 20,
    left: -40,
  },
  decorCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34D39918",
    top: 100,
    right: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34D399",
  },
  logoText: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  avatarBtn: {
    padding: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34D39922",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: "#34D39940",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  badgeText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    lineHeight: 40,
    marginBottom: 12,
  },
  heroAccent: {
    color: "#34D399",
  },
  heroSub: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF0D",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF15",
  },
  statValue: {
    color: "#34D399",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 3,
    textAlign: "center",
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 22,
    marginTop: 36,
    marginBottom: 16,
    gap: 12,
  },
  sectionLabel: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#FFFFFF12",
  },

  // CAROUSEL
  carouselWrap: {
    marginHorizontal: 22,
  },
  slide: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFFFFF12",
  },
  slideGradient: {
    flex: 1,
    padding: 24,
    alignItems: "flex-start",
  },
  slideIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  stepBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    color: "white",
    fontSize: 13,
    fontWeight: "800",
  },
  slideTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 6,
  },
  slideText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#334155",
    marginTop: 8,
  },
  activeDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
    marginTop: 8,
  },

  // FEATURES
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    gap: 10,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 5,
  },
  featureDesc: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
  },

  // DISEASES
  diseasesSection: {
    marginTop: 8,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 22,
    gap: 8,
  },
  tag: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#34D39940",
  },
  tagText: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "600",
  },

  // ABOUT
  aboutStrip: {
    marginHorizontal: 22,
    marginTop: 36,
    borderRadius: 20,
    overflow: "hidden",
  },
  aboutGrad: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  aboutText: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 19,
  },
  aboutAccent: {
    color: "#34D399",
    fontWeight: "700",
  },

  // CTA
  ctaSection: {
    marginHorizontal: 22,
    marginTop: 36,
    gap: 14,
  },
  ctaBtn: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#34D399",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  ctaText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  // CONTACT
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 22,
    marginTop: 32,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactText: {
    color: "#64748B",
    fontSize: 12,
  },
  contactDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#1E293B",
  },

  // FOOTER
  footer: {
    textAlign: "center",
    color: "#334155",
    fontSize: 12,
    marginTop: 24,
    marginBottom: 8,
  },
});