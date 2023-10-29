'use client';

import { sidebarLinks } from '@/constants';
import { isEmpty, isEqual } from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Bottombar = () => {
	const router = useRouter();
	const pathname = usePathname();

	const handleSignOut = () => {
		router.push('sign-in');
	};

	return (
		<section className='bottombar'>
			<div className='bottombar_container'>
				{sidebarLinks.map((link) => {
					const isActive = (pathname.includes(link.route) && !isEmpty(link.route)) || isEqual(pathname, link.route);

					return (
						<Link
							key={link.label}
							href={link.route}
							className={`bottombar_link ${isActive && 'bg-primary-500'}`}
						>
							<Image
								src={link.imgURL}
								alt={link.label}
								width={24}
								height={24}
							/>
							<p className='text-subtitle-medium text-light-1 max-sm:hidden'>{link.label.split(/\s+/)[0]}</p>
						</Link>
					);
				})}
			</div>
		</section>
	);
};

export default Bottombar;
