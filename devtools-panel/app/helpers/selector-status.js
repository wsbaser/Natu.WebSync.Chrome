// import { helper } from '@ember/component/helper';

// export function selectorStatus(params/*, hash*/) {
//   return params;
// }

// export default helper(selectorStatus);

import { helper } from "@ember/component/helper";

function selectorStatus([elementsCount]) {
	switch(elementsCount){
		case 0:
			return "";
		case 1:
			return "exist";
		default:
			return "several";
	}
}

export default helper(selectorStatus);