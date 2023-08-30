import { OrdersService } from '$lib/services'
import { redirect } from '@sveltejs/kit'

export const prerender = false

export async function load({ url, locals, cookies }) {
	const order_no = url.searchParams.get('order_no')
	const failed_url = `/payment/failed?order_no=${order_no}`
	const success_url = `/payment/success?order_no=${order_no}`
	try {
		const res = await OrdersService.cashfreeCapture({
			order_no: order_no,
			storeId: locals.store?.id,
			sid: locals.sid,
			origin: locals.origin
		})
		const status = res?.payment_status || 'FAILED'
		if (status == 'FAILED') {
			throw { status: 307, url: failed_url }
		} else {
			cookies.set('cartQty', '0', { path: '/' })
			throw { status: 307, url: success_url }
		}
	} catch (e) {
		if (e.status == 307) {
			throw redirect(307, e.url)
		} else {
			throw redirect(307, failed_url)
		}
	}
}
