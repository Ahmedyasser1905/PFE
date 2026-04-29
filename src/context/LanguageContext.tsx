import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { I18nManager } from 'react-native';
import { storage } from '~/utils/storage';
import { usersApi } from '~/api/api';
import { STORAGE_KEYS, APP_CONFIG } from '~/constants/config';
import { logger } from '~/utils/errorHandler';

type Language = 'en' | 'ar';

interface TranslationData {
  en: Record<string, string>;
  ar: Record<string, string>;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (path: string) => string;
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(APP_CONFIG.DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<TranslationData>({ en: {}, ar: {} });
  const [isLoading, setIsLoading] = useState(true);

  // ─── Initialize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      // Load language preference
      const cachedLang = await storage.getItem(STORAGE_KEYS.USER_LANGUAGE);
      if (cachedLang === 'en' || cachedLang === 'ar') {
        const lang = cachedLang as Language;
        applyRTL(lang);
        setLanguageState(lang);
      }
      setIsLoading(false);
    };

    init();
  }, []);

  // ─── RTL Application ──────────────────────────────────────────────────────────
  const applyRTL = useCallback((lang: Language) => {
    const shouldBeRTL = lang === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const setLanguage = useCallback(
    async (newLang: Language): Promise<void> => {
      if (newLang === language) return;

      applyRTL(newLang);
      setLanguageState(newLang);
      await storage.setItem(STORAGE_KEYS.USER_LANGUAGE, newLang);
    },
    [language, applyRTL]
  );

  // ─── Local Fallback for construction terms ──────────────────────────────────
  const LOCAL_FALLBACK: TranslationData = {
    en: {
      'home.new_project': 'New Project',
      'home.start_estimation': 'Start Estimation',
      'home.create': 'Create',
      'calc.title': 'QuantiConstruct',
      'calc.input_dimensions': 'INPUT DIMENSIONS',
      'calc.results': 'RESULTS',
      'calc.cost_estimation': 'COST ESTIMATION',
      'calc.formulas': 'FORMULAS',
      'calc.calculate': 'CALCULATE',
      'calc.calculate_costs': 'CALCULATE COSTS',
      'calc.add_to_bom': 'ADD TO PROJECT BOM',
      'calc.add_to_bom_success': 'Calculation added to project bill of quantities successfully.',
      'nav.projects': 'PROJECTS',
      'navigation.home': 'Home',
      'navigation.settings': 'Settings',
      'navigation.projects': 'Projects',
      'navigation.history': 'History',
      'navigation.chat': 'AI Support',
      'common.hello': 'Hello',
      'common.success': 'Success',
      'common.error': 'Error',
      'common.retry': 'Retry',
      'common.cancel': 'Cancel',
      'common.logout': 'Sign Out',
      'common.project_details': 'Project Overview',
      'common.calc_engine': 'Structural Calc',
      'common.all_activities': 'Recent Activity',
      'dashboard.syncing': 'Syncing data...',
      'dashboard.retry_sync': 'Retry Sync',
      'dashboard.projects_stat': 'Projects',
      'dashboard.completed_stat': 'Completed',
      'dashboard.categories_stat': 'Categories',
      'dashboard.all_filter': 'All',
      'dashboard.active_filter': 'Active',
      'dashboard.completed_filter': 'Completed',
      'dashboard.no_projects_found': 'No projects found',
      'projects.title': 'Projects',
      'projects.loading': 'Loading Projects...',
      'projects.active': 'Active',
      'projects.completed': 'Completed',
      'projects.no_projects': 'No projects yet',
      'projects.create_first': 'Create your first project to get started',
      'projects.start_first': 'Start First Project',
      'projects.estimations_count': 'Estimations',
      'projects.new': 'New Project',
      'projects.add_visual': 'Add Project Visual',
      'projects.name_label': 'Project Name',
      'projects.type_label': 'Project Type',
      'projects.location_label': 'Location (City/Area)',
      'projects.budget_label': 'Target Budget Category',
      'projects.notes_label': 'Additional Notes',
      'projects.initialize_btn': 'Initialize Project',
      'projects.select_type': 'Select Category',
      'projects.offline_warning': 'Sorry, the server is currently unreachable. Project creation is disabled in preview mode.',
      'projects.type.residential': 'Residential',
      'projects.type.commercial': 'Commercial',
      'projects.type.industrial': 'Industrial',
      'projects.type.infrastructure': 'Infrastructure',
      'projects.type.renovation': 'Renovation',
      'projects.type.other': 'Other',
      'auth.welcome_back': 'Welcome back',
      'auth.login_desc': 'Log in to manage your construction estimates and projects efficiently.',
      'auth.email_label': 'Email Address',
      'auth.email_placeholder': 'engineer@example.com',
      'auth.password_label': 'Password',
      'auth.password_placeholder': 'enter your password',
      'auth.forgot_password': 'Forgot password?',
      'auth.remember_me': 'Remember for 30 days',
      'auth.login_btn': 'Log In',
      'auth.no_account': "Don't have an account? Sign up",
      'auth.get_started': 'Get started',
      'auth.landing_overline': 'Construction Calculator',
      'auth.landing_title': 'The construction expert',
      'auth.login_link': 'Log in',
      'settings.choose_language': 'Choose Language',
      'settings.personal_info': 'Personal Information',
      'settings.language': 'Language',
      'settings.security': 'Security',
      'settings.subscription': 'Subscription',
      'settings.terms': 'Terms of Service',
      'settings.privacy': 'Privacy Policy',
      'settings.help': 'Help & Support',
      'settings.personal_info_title': 'Personal Information',
      'settings.account_details': 'Account Details',
      'settings.full_name': 'Full Name',
      'settings.name_placeholder': 'Enter your full name',
      'settings.tap_to_change': 'Tap to change profile photo',
      'settings.save_changes': 'Save Changes',
      'settings.read_only': 'Read-only',
      'settings.permission_required': 'Permission Required',
      'settings.photo_library_permission': 'Please allow access to your photo library to change your profile picture.',
      'settings.camera_permission': 'Please allow camera access to take a profile picture.',
      'settings.change_photo_title': 'Change Profile Photo',
      'settings.change_photo_desc': 'Choose a source for your new profile photo.',
      'settings.camera': 'Camera',
      'settings.photo_library': 'Photo Library',
      'settings.profile_updated': 'Profile updated successfully.',
      'settings.security_title': 'Security',
      'settings.change_password_title': 'Change Password',
      'settings.change_password_desc': 'Ensure your account stays secure with a strong password.',
      'settings.current_password': 'Current Password',
      'settings.new_password': 'New Password',
      'settings.confirm_password': 'Confirm New Password',
      'settings.update_password_btn': 'Update Password',
      'settings.updating_btn': 'Updating...',
      'settings.password_success': 'Password updated successfully',
      'projects.details_title': 'Project Details',
      'projects.total_calculations': 'Total Calculations',
      'projects.active_categories': 'Active Categories',
      'projects.overview': 'Project Overview',
      'projects.categories': 'Categories',
      'projects.manage': 'Manage',
      'projects.add_first_category': 'Add your first calculation category',
      'projects.error_loading': 'Failed to load project details',
      'projects.msg_backend_handling': 'This action is currently handled by the backend automatically.',
      'projects.msg_not_supported': 'This action is not supported in the current version.',
      'projects.recent_activity': 'Recent Activity',
      'projects.mark_completed': 'Mark as Completed',
      'projects.restore_active': 'Restore to Active',
      'projects.archive_project': 'Archive Project',
      'projects.status_active': 'ACTIVE',
      'projects.status_completed': 'COMPLETED',
      'projects.default_description': 'Modern construction project monitoring and structural estimation dashboard for efficient resource planning.',
      'projects.tag_concrete': 'REINFORCED CONCRETE',
      'projects.tag_structural': 'STRUCTURAL WORKS',
      'cat.title': 'Structure Categories',
      'cat.select_category': 'Select structural area',
      'cat.explore_desc': 'Browse construction categories for your bill of quantities.',
      'cat.saved': 'SAVED',
      'calc.preparing': 'Preparing Calculation Engine...',
      'calc.error_title': 'Oops! Something went wrong',
      'calc.error_desc': "We couldn't load this calculation category.",
      'calc.retry': 'RETRY LOADING',
      'calc.go_back': 'Go Back',
      'calc.breadcrumb_projects': 'PROJECTS',
      'calc.subtitle': 'Structural quantities configuration for construction items.',
      'calc.concrete_grade': 'CONCRETE GRADE',
      'calc.standard_concrete': 'C25/30 - Standard Structural',
      'calc.reset': 'RESET VALUES',
      'calc.ready': 'READY',
      'calc.pending': 'PENDING',
      'calc.volume': 'VOLUME',
      'calc.area': 'AREA',
      'calc.excavation': 'EXCAVATION',
      'calc.steel': 'STEEL',
      'calc.optional': 'OPTIONAL',
      'calc.cost_desc': 'Get an automated cost estimate based on current market rates.',
      'calc.primary_method': 'PRIMARY METHOD',
      'calc.alternative_method': 'ALTERNATIVE METHOD',
      'calc.success_title': 'Success',
      'calc.success_msg': 'Added to Project BOM',
      'calc.error_calc_first': 'Please calculate first',
      'cat.grand_travaux': 'Grand Travaux',
      'cat.gros_oeuvre': 'Gros Oeuvre',
      'cat.fondations': 'Fondations',
      'cat.maconnerie': 'Maçonnerie',
      'cat.finition': 'Finition',
      'cat.ouvertures': 'Portes & Fenêtres',
      'cat.empty_title': 'No Categories Found',
      'cat.empty_subtitle': 'This section does not contain any sub-categories at the moment.',
    },
    ar: {
      'home.new_project': 'مشروع جديد',
      'home.start_estimation': 'ابدأ التقدير',
      'home.create': 'إنشاء',
      'calc.title': 'كوانتي-كونستراكت',
      'calc.add_to_bom_success': 'تمت إضافة الحساب بنجاح إلى فواتير المشروع.',
      'nav.projects': 'المشاريع',
      'navigation.home': 'الرئيسية',
      'navigation.settings': 'الإعدادات',
      'navigation.projects': 'المشاريع',
      'navigation.history': 'السجلات',
      'navigation.chat': 'الذكاء الاصطناعي',
      'common.hello': 'مرحباً',
      'common.success': 'نجاح',
      'common.info': 'معلومات',
      'common.unknown': 'غير معروف',
      'common.error': 'خطأ',
      'common.retry': 'إعادة المحاولة',
      'common.cancel': 'إلغاء',
      'common.logout': 'تسجيل الخروج',
      'common.project_details': 'تفاصيل المشروع',
      'common.calc_engine': 'محرك الحسابات',
      'common.all_activities': 'كل الأنشطة',
      'dashboard.syncing': 'جاري المزامنة...',
      'dashboard.retry_sync': 'إعادة المحاولة',
      'dashboard.projects_stat': 'المشاريع',
      'dashboard.completed_stat': 'مكتملة',
      'dashboard.categories_stat': 'التصنيفات',
      'dashboard.all_filter': 'الكل',
      'dashboard.active_filter': 'نشط',
      'dashboard.completed_filter': 'مكتمل',
      'dashboard.no_projects_found': 'لم يتم العثور على مشاريع',
      'projects.title': 'المشاريع',
      'projects.loading': 'جاري تحميل المشاريع...',
      'projects.active': 'نشط',
      'projects.completed': 'مكتمل',
      'projects.no_projects': 'لا توجد مشاريع بعد',
      'projects.create_first': 'أنشئ مشروعك الأول للبدء',
      'projects.start_first': 'ابدأ أول مشروع',
      'projects.estimations_count': 'تقديرات',
      'projects.new': 'مشروع جديد',
      'projects.add_visual': 'إضافة صورة للمشروع',
      'projects.name_label': 'اسم المشروع',
      'projects.type_label': 'نوع المشروع',
      'projects.location_label': 'الموقع (المدينة/المنطقة)',
      'projects.budget_label': 'فئة الميزانية المستهدفة',
      'projects.notes_label': 'ملاحظات إضافية',
      'projects.initialize_btn': 'بدء المشروع',
      'projects.select_type': 'اختر الفئة',
      'projects.offline_warning': 'عذراً، الخادم غير متاح حالياً. لا يمكن إنشاء مشاريع جديدة في وضع المعاينة.',
      'projects.type.residential': 'سكني',
      'projects.type.commercial': 'تجاري',
      'projects.type.industrial': 'صناعي',
      'projects.type.infrastructure': 'بنية تحتية',
      'projects.type.renovation': 'ترميم',
      'projects.type.other': 'آخر',
      'auth.welcome_back': 'مرحباً بعودتك',
      'auth.login_desc': 'سجل الدخول لإدارة تقديرات البناء والمشاريع بكفاءة.',
      'auth.email_label': 'البريد الإلكتروني',
      'auth.email_placeholder': 'engineer@example.com',
      'auth.password_label': 'كلمة المرور',
      'auth.password_placeholder': 'أدخل كلمة المرور',
      'auth.forgot_password': 'نسيت كلمة المرور؟',
      'auth.remember_me': 'تذكرني لمدة 30 يومًا',
      'auth.login_btn': 'تسجيل الدخول',
      'auth.no_account': 'ليس لديك حساب؟ سجل الآن',
      'auth.get_started': 'ابدأ الآن',
      'auth.landing_overline': 'حاسبة البناء',
      'auth.landing_title': 'خبير البناء',
      'auth.login_link': 'تسجيل الدخول',
      'settings.choose_language': 'اختر اللغة',
      'settings.personal_info': 'المعلومات الشخصية',
      'settings.language': 'اللغة',
      'settings.security': 'الأمان',
      'settings.subscription': 'الاشتراك',
      'settings.terms': 'شروط الخدمة',
      'settings.privacy': 'سياسة الخصوصية',
      'settings.help': 'المساعدة والدعم',
      'settings.personal_info_title': 'المعلومات الشخصية',
      'settings.account_details': 'تفاصيل الحساب',
      'settings.full_name': 'الاسم الكامل',
      'settings.name_placeholder': 'أدخل اسمك الكامل',
      'settings.tap_to_change': 'اضغط لتغيير الصورة الشخصية',
      'settings.save_changes': 'حفظ التغييرات',
      'settings.read_only': 'للقراءة فقط',
      'settings.permission_required': 'مطلوب إذن',
      'settings.photo_library_permission': 'يرجى السماح بالوصول إلى مكتبة الصور لتغيير صورتك الشخصية.',
      'settings.camera_permission': 'يرجى السماح بالوصول إلى الكاميرا لالتقاط صورة شخصية.',
      'settings.change_photo_title': 'تغيير الصورة الشخصية',
      'settings.change_photo_desc': 'اختر مصدراً لصورتك الشخصية الجديدة.',
      'settings.camera': 'الكاميرا',
      'settings.photo_library': 'مكتبة الصور',
      'settings.profile_updated': 'تم تحديث الملف الشخصي بنجاح.',
      'settings.security_title': 'الأمان',
      'settings.change_password_title': 'تغيير كلمة المرور',
      'settings.change_password_desc': 'تأكد من بقاء حسابك آمناً باستخدام كلمة مرور قوية.',
      'settings.current_password': 'كلمة المرور الحالية',
      'settings.new_password': 'كلمة المرور الجديدة',
      'settings.confirm_password': 'تأكيد كلمة المرور الجديدة',
      'settings.update_password_btn': 'تحديث كلمة المرور',
      'settings.updating_btn': 'جاري التحديث...',
      'settings.password_success': 'تم تحديث كلمة المرور بنجاح',
      'projects.details_title': 'تفاصيل المشروع',
      'projects.total_calculations': 'إجمالي الحسابات',
      'projects.active_categories': 'الأصناف النشطة',
      'projects.overview': 'نظرة عامة على المشروع',
      'projects.categories': 'الأصناف',
      'projects.manage': 'إدارة',
      'projects.add_first_category': 'أضف أول صنف حساب لك',
      'projects.error_loading': 'فشل في تحميل تفاصيل المشروع',
      'projects.msg_backend_handling': 'يتم التعامل مع هذا الإجراء حالياً بواسطة النظام تلقائياً.',
      'projects.msg_not_supported': 'هذا الإجراء غير مدعوم في الإصدار الحالي.',
      'projects.recent_activity': 'النشاط الأخير',
      'projects.mark_completed': 'تحديد كمكتمل',
      'projects.restore_active': 'استعادة إلى نشط',
      'projects.archive_project': 'أرشفة المشروع',
      'projects.status_active': 'نشط',
      'projects.status_completed': 'مكتمل',
      'projects.default_description': 'لوحة مراقبة مشاريع البناء الحديثة وتقدير الهياكل للتخطيط الفعال للموارد.',
      'projects.tag_concrete': 'خرسانة مسلحة',
      'projects.tag_structural': 'أشغال كبرى',
      'cat.title': 'أصناف الهيكل',
      'cat.select_category': 'اختر منطقة الهيكل',
      'cat.explore_desc': 'تصفح أصناف البناء لجدول الكميات الخاص بك.',
      'cat.saved': 'محفوظ',
      'calc.preparing': 'جاري تحضير محرك الحساب...',
      'calc.error_title': 'عذراً! حدث خطأ ما',
      'calc.error_desc': 'تعذر تحميل صنف الحساب هذا.',
      'calc.retry': 'إعادة المحاولة',
      'calc.go_back': 'الرجوع',
      'calc.breadcrumb_projects': 'المشاريع',
      'calc.subtitle': 'تهيئة الكميات الهيكلية لعناصر البناء.',
      'calc.input_dimensions': 'أبعاد المدخلات',
      'calc.concrete_grade': 'درجة الخرسانة',
      'calc.standard_concrete': 'C25/30 - خرسانة إنشائية قياسية',
      'calc.calculate': 'حساب',
      'calc.reset': 'إعادة تعيين القيم',
      'calc.results': 'النتائج',
      'calc.ready': 'جاهز',
      'calc.pending': 'قيد الانتظار',
      'calc.volume': 'الحجم',
      'calc.area': 'المساحة',
      'calc.excavation': 'الحفر',
      'calc.steel': 'الحديد',
      'calc.cost_estimation': 'تقدير التكلفة',
      'calc.optional': 'اختياري',
      'calc.cost_desc': 'احصل على تقدير تكلفة آلي بناءً على أسعار السوق الحالية.',
      'calc.calculate_costs': 'حساب التكاليف',
      'calc.formulas': 'المعادلات',
      'calc.primary_method': 'الطريقة الأساسية',
      'calc.alternative_method': 'الطريقة البديلة',
      'calc.add_to_bom': 'إضافة إلى جدول كميات المشروع',
      'calc.success_title': 'تم بنجاح',
      'calc.success_msg': 'تمت الإضافة إلى جدول كميات المشروع',
      'calc.error_calc_first': 'يرجى الحساب أولاً',
      'cat.grand_travaux': 'أشغال كبرى',
      'cat.gros_oeuvre': 'الهيكل الإنشائي',
      'cat.fondations': 'الأساسات',
      'cat.maconnerie': 'أعمال البناء',
      'cat.finition': 'التشطيبات',
      'cat.ouvertures': 'الأبواب والنوافذ',
      'cat.empty_title': 'لا توجد تصنيفات',
      'cat.empty_subtitle': 'هذا القسم لا يحتوي على أي تصنيفات فرعية في الوقت الحالي.',
    }
  };


  // ─── Translation Function ────────────────────────────────────────────────────
  const t = useCallback(
    (path: string): string => {
      const langDict = translations[language];
      
      // 1. Check DB/Cache translations first
      if (langDict && langDict[path]) return langDict[path];
      
      // 2. Check Local Fallback
      if (LOCAL_FALLBACK[language][path]) return LOCAL_FALLBACK[language][path];
      
      // 3. Fallback to human readable string instead of raw key (e.g. 'home.new_project' -> 'New Project')
      const keyParts = path.split('.');
      const lastPart = keyParts[keyParts.length - 1] || path;
      return lastPart
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
    [language, translations]
  );


  const value = useMemo(
    () => ({ language, setLanguage, t, isRTL: language === 'ar', isLoading }),
    [language, setLanguage, t, isLoading]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
