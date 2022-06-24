export enum ACTIONS {
  CONNECTION = 'CONNECTION',
  GET_ALL_REPOS = 'GET_ALL_REPOS',
  SET_TX_NOTIFY = 'SET_TX_NOTIFY',
  REMOVE_TX = 'REMOVE_TX',
  SET_TX = 'SET_TX',
  ERROR = 'ERROR',
  REPO_META = 'REPO_META',
  REPO_REFS = 'REPO_REFS',
  COMMIT = 'COMMIT',
  TREE_DATA = 'TREE_DATA',
  CREATE_REPOS = 'CREATE_REPOS',
  DELETE_REPOS = 'DELETE_REPOS',
  SET_FILE_TEXT = 'SET_FILE_TEXT',
  SET_SEARCH = 'SET_SEARCH',
  SET_COMMIT_HASH = 'SET_COMMIT_HASH',
  SET_COMMITS_LIST = 'SET_COMMITS_LIST',
  SET_BRANCH_REF_LIST = 'SET_BRANCH_REF_LIST',
  SET_REPO_MAP = 'SET_REPO_MAP',
  SET_REPO_ID = 'SET_REPO_ID',
  SET_PREV_REPO_HREF = 'SET_PREV_REPO_HREF',
  SET_WALLET_STATUS = 'SET_WALLET_STATUS',
  SET_WALLET_ADDRESS_LIST = 'SET_WALLET_ADDRESS_LIST',
  SET_GENERATED_SEED = 'SET_GENERATED_SEED',
  SET_WALLET_CONNECTION = 'SET_WALLET_CONNECTION',
  SET_SEED_TO_VALIDATION = 'SET_SEED_TO_VALIDATION',
  SET_PUBLIC_KEY = 'SET_PUBLIC_KEY',
  SET_LOCAL_MAP = 'SET_LOCAL_MAP',
  SET_REPO_METAS = 'SET_REPO_METAS',
  SET_REPO_FILE = 'SET_REPO_FILE',
  SET_TX_LIST = 'SET_TX_LIST',
  SET_ORGANIZATIONS = 'SET_ORGANIZATIONS',
  SET_PROJECTS = 'SET_PROJECTS',
  SET_COMMITS_MAP = 'SET_COMMITS_MAP'
}

export enum ActionColor {
  BRIGHT_TEAL = 'rgba(0, 246, 210, 0.2)',
  DARKISH_BLUE = 'rgba(0, 69, 143, 0.2)',
  LIGHTGREEN = 'rgba(115, 255, 124, 0.2)',
  SMTH_RED = 'rgba(255, 116, 107, 0.2)',
  SMTH_BLUE = 'rgba(79, 165, 255, 0.2)',
  SMTH_DARK_BLUE = 'rgba(129, 146, 163, 0.2)',
  SMTH_VIOLET = 'rgba(216, 133, 255, 0.2)',
  SMTH_YELLOW = 'rgba(255, 231, 90, 0.2)',
  SMTH_GREEN = 'rgba(42, 207, 29, 0.2)',
  SMTH_PURPLE = 'rgba(100, 100, 255, 0.2)',
  SMTH_ORANGE = 'rgba(255, 122, 33, 0.2)'
}

export enum Routes {
  AUTH = 'auth',
  MAIN = 'main'
}

export enum LoadingMessages {
  COMMIT = 'Loading commit data...',
  COMMIT_TREE = 'Building commit tree...',
  BRANCHES = 'Loading branches...',
  TREE = 'Loading file tree...',
  FILE = 'Loading file...',
  HEADLESS = 'Loading decentralized application...'
}

export enum ToastMessages {
  EXT_ON_CONN_ERR = 'Web wallet is trying to connect at the moment',
  EXT_ERR_MSG = 'Extension not found. Please, install the extension from the website and reload the Sourc3',
  WALLET_CONNECTED = 'Web wallet connected!',
  HEADLESS_CONNECTED = 'Headless wallet connected!',
}

export enum COLORS {
  GREEN = '#3FD05A',
  ORANGE = '#FF791F',
  RED = '#FF3346'
}

export enum MODE { AUTHINFO, SEED, CONFIRM, PASS, OK, SUCCESS, LOADING }

export enum RestoreStatus { SEED, PASS, OK, LOADING }

export enum MODAL { NONE, REPOS, CLONE, ORGANIZATION, PROJECT, ADD }
