/*
* @Author: ReJiKai
* @Date:   2019-03-02 20:11:02
* @Last Modified by:   ReJiKai
* @Last Modified time: 2019-03-02 21:14:57
*/

const _fetch = async (url, data) => {
	return await fetch(url, {
		method: 'POST',
		mode: 'cors',
		headers:{
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	}).then(res => res.text());
}
