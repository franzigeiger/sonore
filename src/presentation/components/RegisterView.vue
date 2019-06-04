<template>
  <div id="register-view">
    <div class="d-flex flex-wrap justify-content-between align-items-baseline">
      <b-form-input :state="name? 'valid' : 'invalid'"
                    v-model="name"
                    type="text"
                    placeholder="Registername"
                    class="w-20"
                    @change="updateName"></b-form-input>
      
      <div>
        <label class="pr-3">Stimmführer</label>
        <b-dropdown id="principal-dropdown"
                    :text="principal ? principal.name : 'Bitte wählen'"
                    :variant="principal? 'info' : 'danger'">
          <b-dropdown-item-button @click="updatePrincipal(user)" v-for="user in profiles" :key="user.id">
            {{user.name}}
          </b-dropdown-item-button>
        </b-dropdown>
      </div>
      
      <b-form-group>
        <b-form-radio-group buttons id="register-part-choice" v-model="type">
          <b-form-radio :value="partType">
            Stimmregister
          </b-form-radio>
          <b-form-radio :value="registerType" :disabled="allRegisters.length === 0">
            Aggregiertes Register
          </b-form-radio>
        </b-form-radio-group>
      </b-form-group>
    </div>
    
    <InstrumentSelection :all="availableItems()" :selected="selectedItems()" :displayName="(item) => item.name"
                         @updated="updateItems">
    </InstrumentSelection>
  </div>
</template>

<script lang="ts">
  import {SinglePart} from "@/common/data-definitions/parts/single-part";
  import {Register, RegisterType} from "@/common/data-definitions/register";
  import {User} from "@/common/data-definitions/user";
  import {Logger} from "@/common/logging";
  import {TYPES} from "@/inversify-types";
  import InstrumentSelection from "@/presentation/components/ItemMultiselect.vue";
  import {PartService} from "@/services/part-service";
  import {RegisterService} from "@/services/register-service";
  import {serviceContainer} from "@/services/service-container";
  import {UserService} from "@/services/user-service";
  import {Toaster} from "@/toaster";
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  
  @Component({
    components: {
      InstrumentSelection,
    },
  })
  export default class RegisterView extends Vue {
    @Prop() private register!: Register | null;
    
    // for use in the template
    private readonly partType = RegisterType.Part;
    private readonly registerType = RegisterType.Register;
    
    private name: string | null = null;
    private principal: User | null = null;
    private type: RegisterType = RegisterType.Part;
    private selectedParts: SinglePart[] = [];
    private selectedRegisters: Register[] = [];
    
    private profiles: User[];
    private allParts: SinglePart[];
    private allRegisters: Register[];
    private log: Logger = Logger.getNew(RegisterView.name);
    
    constructor() {
      super();
      
      this.profiles = serviceContainer.get<UserService>(TYPES.UserService).getAllUsers();
      // this is only loaded once, but might change. User needs to go back and forth again for reload
      this.allRegisters = this.filterSuperRegisters(
        serviceContainer.get<RegisterService>(TYPES.RegisterService).getAllRegisters());
      this.allParts = serviceContainer.get<PartService>(TYPES.PartService).getAllParts();
    }
    
    private filterSuperRegisters(registers: Register[]): Register[] {
      // avoids putting self into the register selection
      // tries to avoid putting parents of self into register selection
      return registers.filter((register) => {
        if (this.register == null) { return true; }
        if (register.guid === this.register.guid) { return false; }
        if (register.type === RegisterType.Part) { return true; }
        return this.filterSuperRegisters(register.children as Register[]).length === 1;
      });
    }
    
    @Watch("register")
    private onRegisterChanged(val: Register | null, oldVal: Register | null) {
      this.inputUpdated();
    }
    
    private mounted() {
      this.log.debug("Mounted called");
      this.inputUpdated();
    }
    
    private inputUpdated(): void {
      if (this.register != null) {
        this.name = this.register.name;
        this.principal = this.register.principal;
        this.type = this.register.type;
        if (this.type === RegisterType.Part) {
          this.selectedParts = this.register.children as SinglePart[];
        } else if (this.type === RegisterType.Register) {
          this.selectedRegisters = this.register.children as Register[];
        } else if (this.register.children.length > 0) {
          this.log.error("Invalid register loaded");
        }
      } else {
        this.name = null;
        this.principal = null;
        this.selectedParts = [];
        this.selectedRegisters = [];
        this.type = RegisterType.Part;
      }
    }
    
    private availableItems() {
      return this.type === RegisterType.Part ? this.allParts : this.allRegisters;
    }
    
    private selectedItems() {
      return this.type === RegisterType.Part ? this.selectedParts : this.selectedRegisters;
    }
    
    private updateItems(selected: SinglePart[] | Register[]) {
      if (this.type === RegisterType.Part) {
        this.selectedParts = selected as SinglePart[];
      } else {
        this.selectedRegisters = this.filterSuperRegisters(selected as Register[]);
        if (this.selectedRegisters.length !== selected.length) {
          Toaster.settingsRecursiveRegisterError();
        }
      }
      this.emitUpdate();
    }
    
    private updatePrincipal(user: User): void {
      this.log.debug("Updated principal to " + user.name);
      this.principal = user;
      this.emitUpdate();
    }
    
    private updateName(name: string): void {
      this.log.debug("Updated name to " + name);
      this.emitUpdate();
    }
    
    private emitUpdate(): void {
      if (!this.name || !this.principal) {
        this.log.info("Update not stored yet, missing name or principal");
        return;
      }
      this.log.debug("Updating register");
      if (this.register === null) {
        this.$emit("update", this.type === RegisterType.Part ?
                             Register.partRegister(this.name, this.principal, this.selectedParts) :
                             Register.registerRegister(this.name, this.principal, this.selectedRegisters));
      } else {
        // avoid changing the guid
        this.register.name = this.name;
        this.register.principal = this.principal;
        if (this.type === RegisterType.Part) {
          this.register.parts = this.selectedParts;
        } else {
          this.register.subregisters = this.selectedRegisters;
        }
        this.$emit("update", this.register);
      }
    }
  }
</script>

<style scoped>
  #register-view {
    width: 80%;
    max-width: 700px;
    margin: 20px auto;
  }
  
  #register-view > * {
    margin-bottom: 20px;
  }
  
  h5 {
    text-align: center;
  }
  
  .w-20 {
    width: 20%;
  }
</style>
