<template>
  <div>
    <div class="content">
      <q-card class="register-card">
        <q-card-section class="card-title">
          <span>{{ $t("ChangePassword.Title") }}</span>
          <router-link
            style="font-size: 16px; font-weight: 200; margin-right: 10px"
            class="link"
            :to="{ path: '/changepassword/phone' }"
            >{{ $t("ChangePassword.UsePhone") }}</router-link
          >
        </q-card-section>
        <q-card-section>
          <q-form class="register-form">
            <q-input
              class="register-input"
              outlined
              bg-color="blue-grey-1"
              v-model="myEmail"
              :label="$t('ChangePassword.Email.EmailInput')"
              lazy-rules
              :rules="[
                (val) =>
                  parseEmail(val) ||
                  $t('ChangePassword.Email.EmailInputWarning'),
              ]"
              ref="emailRef"
              disable
            ></q-input>

            <send-code-input
              :verifyParam="myEmail"
              verifyType="email"
            ></send-code-input>

            <q-input
              ref="oldPasswordRef"
              class="register-input"
              outlined
              bg-color="blue-grey-1"
              v-model="changePasswordInput.oldPassword"
              :label="$t('ChangePassword.OldPassword')"
              :type="isOldPwd ? 'password' : 'text'"
              lazy-rules
              :rules="[
                (val) =>
                  parsePassword(val) || $t('ChangePassword.OldPasswordWarning'),
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="isOldPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isOldPwd = !isOldPwd"
                />
              </template>
            </q-input>

            <q-input
              ref="passwordRef"
              class="register-input"
              outlined
              bg-color="blue-grey-1"
              v-model="password"
              :label="$t('ChangePassword.Password')"
              :type="isPwd ? 'password' : 'text'"
              lazy-rules
              :rules="passwordRule"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <q-input
              ref="confirmPasswordRef"
              class="register-input"
              outlined
              bg-color="blue-grey-1"
              v-model="confirmPassword"
              :label="$t('ChangePassword.ConfirmPassword')"
              :type="isCPwd ? 'password' : 'text'"
              lazy-rules
              :rules="confirmPassRule"
            >
              <template v-slot:append>
                <q-icon
                  :name="isCPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isCPwd = !isCPwd"
                />
              </template>
            </q-input>

            <q-btn class="register-btn" @click="onConfirm">{{
              $t("ChangePassword.ConfirmBtn")
            }}</q-btn>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  ref,
  reactive,
  computed,
  onMounted,
  watch,
} from "vue";
import { api } from "src/boot/axios";
import { useStore } from "vuex";
import { fail, success, waiting } from "src/notify/notify";
import { parseEmail, parsePassword, sha256Password } from "src/utils/utils";
import { throttle, useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import SendCodeInput from "src/components/SendCodeInput.vue";
import { failCodeError } from "src/utils/utils";

export default defineComponent({
  components: { SendCodeInput },
  setup() {
    const q = useQuasar();
    const { t } = useI18n({ useScope: "global" });
    const $store = useStore();

    const verifyCode = computed({
      get: () => $store.state.verify.verifyCode,
      set: (val) => {
        $store.commit("verify/updateVerifyCode", val);
      },
    });

    onMounted(() => {
      verifyCode.value = "";
    });

    const myEmail = computed(
      () => $store.state.user.user.info.UserBasicInfo.EmailAddress
    );

    const emailRef = ref(null);
    const oldPasswordRef = ref(null);
    const passwordRef = ref(null);
    const confirmPasswordRef = ref(null);

    const password = ref("");
    const confirmPassword = ref("");

    const changePasswordInput = reactive({
      email: "",
      oldPassword: "",
    });

    const passwordRule = ref([
      (val) => parsePassword(val) || t("ChangePassword.PasswordInputWarning"),
      (val) =>
        (val && val === confirmPassword.value) ||
        t("Register.ConfirmInputWarning2"),
    ]);

    const confirmPassRule = ref([
      (val) => parsePassword(val) || t("Register.ConfirmInputWarning1"),
      (val) =>
        (val && val === password.value) || t("Register.ConfirmInputWarning2"),
    ]);

    watch([password, confirmPassword], ([p, cp], [prep, precp]) => {
      if (p === cp) {
        passwordRef.value.validate();
        confirmPasswordRef.value.validate();
      }
    });

    return {
      verifyCode,
      changePasswordInput,
      emailRef,
      oldPasswordRef,
      passwordRef,
      confirmPasswordRef,
      confirmPassRule,
      parsePassword,
      parseEmail,
      passwordRule,
      password,
      confirmPassword,
      q,
      myEmail,
    };
  },

  data() {
    return {
      isPwd: true,
      isCPwd: true,
      isOldPwd: true,
    };
  },

  created: function () {
    this.onConfirm = throttle(this.onConfirm, 1000);
  },

  methods: {
    onConfirm: function () {
      this.emailRef.validate();
      this.oldPasswordRef.validate();
      this.passwordRef.validate();
      this.confirmPasswordRef.validate();

      if (
        this.emailRef.hasError ||
        this.oldPasswordRef.hasError ||
        this.passwordRef.hasError ||
        this.confirmPasswordRef.hasError
      ) {
        return;
      }

      var self = this;

      var password = sha256Password(this.password);

      api
        .post("/user-management/v1/change/password", {
          VerifyParam: self.myEmail,
          Password: password,
          OldPassword: sha256Password(self.changePasswordInput.oldPassword),
          VerifyType: "email",
          Code: self.verifyCode,
        })
        .then((resp) => {
          success(undefined, self.$t("Notify.ChangePassword.Success"));
          self.verifyCode = "";
          this.q.cookies.remove("UserID");
          this.q.cookies.remove("AppSession");
          this.q.cookies.remove("Session");
          self.verifyCode = "";

          self.$store.commit("user/updateUserLogined", false);
          self.$router.push("/login");
        })
        .catch((error) => {
          failCodeError(
            undefined,
            error,
            self.$t("Notify.ChangePassword.Fail2"),
            self.$t("CodeFail.Fail1"),
            self.$t("CodeFail.Fail2")
          );
        });
    },
  },
});
</script>

<style scoped src="../../css/register-style.css"></style>
<style>
.q-field--error .q-field__bottom {
  color: #fc4468;
}
</style>
