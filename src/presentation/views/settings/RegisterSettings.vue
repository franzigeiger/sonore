<template>
  <div>
    <Navbar centerText="Register"
            @navbar-search-update="searchString = $event"
            :displayMode="navbarMode"
            backTarget="/settings"></Navbar>
    
    <div role="tablist">
      <b-card v-for="(register, index) in filteredRegisters()"
              :key="register? register.guid : 'newregister'"
              @click="openRegister = index"
              no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-btn block href="#"
                 v-b-toggle="register? register.guid : 'newregister'"
                 :variant="register? 'info' : 'danger'">
            {{ register? register.name : 'Neues Register (ungespeichert)' }}
          </b-btn>
        </b-card-header>
        <b-collapse :id="register? register.guid : 'newregister'"
                    :visible="index === openRegister"
                    accordion="registers" role="tabpanel">
          <RegisterView :register="register" @update="updateRegister(index, $event)"></RegisterView>
        </b-collapse>
      </b-card>
    </div>
    <FloatingButton icon="fa-plus" @click="createRegister()" :disabled="addingRegister"></FloatingButton>
  </div>
</template>

<script lang="ts">
  import {Register} from "@/common/data-definitions/register";
  import {Logger} from "@/common/logging";
  import {TYPES} from "@/inversify-types";
  import FloatingButton from "@/presentation/components/FloatingButton.vue";
  import {settingsNavbarMode} from "@/presentation/components/navbar-modes";
  import Navbar from "@/presentation/components/Navbar.vue";
  import RegisterView from "@/presentation/components/RegisterView.vue";
  import {RegisterService} from "@/services/register-service";
  import {serviceContainer} from "@/services/service-container";
  import {Component, Vue} from "vue-property-decorator";
  
  @Component({
    components: {
      Navbar,
      RegisterView,
      FloatingButton,
    },
  })
  export default class RegisterSettings extends Vue {
    private registerService = serviceContainer.get<RegisterService>(TYPES.RegisterService);
    private registers: Array<Register | null> = this.registerService.getAllRegisters().slice();
    
    private navbarMode = settingsNavbarMode;
    private searchString: string = "";
    private addingRegister = false;
    private openRegister = 0;
    
    private log = Logger.getNew(RegisterSettings.name);
    
    private createRegister(): void {
      this.addingRegister = true;
      this.openRegister = this.registers.length;
      this.registers.push(null);
    }
    
    private updateRegister(index: number, register: Register) {
      if (this.registers[index] === null) {
        this.log.debug("Register {} created", register.name);
        this.registerService.addRegister(register);
        this.addingRegister = false;
      } else {
        this.log.debug("Updating {}: {}", register.name, register);
        this.registerService.updateRegister(register);
      }
      this.registers.splice(index, 1, register);
    }
    
    private filteredRegisters() {
      // for the search function of the navbar
      return this.registers.filter((register) => {
        // NOTE possibly filter for contained registers/instruments as well
        return register === null || this.anyMatch(this.searchString, register.name, register.principal.name);
      });
    }
    
    private anyMatch(filter: string, ...strings: string[]) {
      return strings.filter((s) => s.toLocaleLowerCase().includes(filter.toLocaleLowerCase())).length > 0;
    }
  
    private reload() {
      this.registers = this.registerService.getAllRegisters().slice();
    }
    
    private mounted() {
      this.registerService.registerRegisterChangedCallback(this.reload);
    }
    
    private beforeDestroy() {
      this.registerService.unregisterRegisterChangedCallback();
    }
  }
</script>
