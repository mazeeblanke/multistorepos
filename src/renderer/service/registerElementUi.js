import {
  Table,
  TableColumn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Tabs,
  TabPane,
  Select,
  Tooltip,
  Option,
  Collapse,
  CollapseItem,
  Input,
  InputNumber,
  Button,
  Steps,
  Step,
  Alert,
  Dialog,
  Form,
  FormItem,
  Progress,
  Loading,
  Autocomplete,
  Checkbox,
  DatePicker,
  Radio,
  Popover,
  Menu,
  Switch,
  MenuItem
} from 'element-ui'
import Vue from 'vue'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'
import '../../../theme/index.css'

Vue.use(Select)
Vue.use(Dropdown)
Vue.use(DropdownItem)
Vue.use(DropdownMenu)
Vue.use(Option)
Vue.use(Dialog)
Vue.use(TableColumn)
Vue.use(Radio)
Vue.use(Tabs)
Vue.use(Alert)
Vue.use(Tooltip)
Vue.use(TabPane)
Vue.use(Autocomplete)
Vue.use(Checkbox)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Option)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Button)
Vue.use(DatePicker)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Menu)
Vue.use(Switch)
Vue.use(MenuItem)
Vue.use(Table)
Vue.use(Loading)
Vue.use(Popover)
Vue.use(Progress)
locale.use(lang)
