import React from 'react';
import './lumis-treatment-artwork.css';

const imgPlusSmall11 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgPlusSmall11.svg`;
const imgMenuDots1 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgMenuDots1.svg`;
const imgAngleSmallDown1 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgAngleSmallDown1.svg`;
const imgLine76 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgLine76.svg`;
const imgFrame471 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgFrame471.svg`;
const imgFrame474 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgFrame474.svg`;
const imgAngleSmallDown2 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgAngleSmallDown2.svg`;
const imgClockFive1 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgClockFive1.svg`;
const imgAngleSmallDown3 = `${import.meta.env.BASE_URL}assets/lumis/treatment-imgAngleSmallDown3.svg`;

export default function LumisTreatmentArtwork({ property1 = "Frame 386" }) {
  const isFrame759 = property1 === "Frame 759";
  return (
    <div className="tp-card" data-variant={property1} id={isFrame759 ? "node-3439_28651" : "node-3439_28652"}>
      <div className="tp-0" id={isFrame759 ? "node-3439_28544" : "node-3439_28469"}>
        <p className="tp-1" id={isFrame759 ? "node-3439_28545" : "node-3439_28470"}>
          {isFrame759 ? "Treatment Plan" : "Skincare Routine"}
        </p>
        <div className="tp-2" id={isFrame759 ? "node-3439_28546" : "node-3439_28471"}>
          <div className="tp-3" id={isFrame759 ? "node-3439_28547" : "node-3439_28472"}>
            <div className="tp-4" id={isFrame759 ? "node-3439_28548" : "node-3439_28473"} data-name="plus-small (1) 1">
              <img alt="" className="tp-5" src={imgPlusSmall11} />
            </div>
          </div>
          <div className="tp-3" id={isFrame759 ? "node-3439_28549" : "node-3439_28474"}>
            <div className="tp-6" id={isFrame759 ? "node-3439_28550" : "node-3439_28475"} data-name="menu-dots 1">
              <img alt="" className="tp-5" src={imgMenuDots1} />
            </div>
          </div>
        </div>
      </div>
      {property1 === "Frame 386" && (
        <div className="tp-7" data-node-id="3439:28476">
          <div className="tp-8" data-node-id="3439:28477">
            <div className="tp-9" data-node-id="3439:28478">
              <div className="tp-10" data-node-id="3439:28479">
                <div className="tp-11" data-node-id="3439:28480">
                  <p className="tp-12" data-node-id="3439:28481">{`SPF 50 gel sunscreen `}</p>
                  <p className="tp-13" data-node-id="3439:28482">
                    Acts as the skincare protection against UV
                  </p>
                </div>
                <div className="tp-14" data-node-id="3439:28483">
                  <div className="tp-15" data-node-id="3439:28484">
                    <p className="tp-16" data-node-id="I3439:28484;306:6719">
                      Mornings
                    </p>
                  </div>
                  <div className="tp-17" data-node-id="3439:28485">
                    <p className="tp-18" data-node-id="I3439:28485;306:6719">
                      Non-negotiable
                    </p>
                  </div>
                  <div className="tp-6" data-node-id="3439:28486" data-name="angle-small-down 1">
                    <img alt="" className="tp-5" src={imgAngleSmallDown1} />
                  </div>
                </div>
              </div>
              <div className="tp-19" data-node-id="3439:28487">
                <div className="tp-20" data-node-id="3439:28488">
                  <div className="tp-21" data-node-id="3439:28489">
                    <p className="tp-22" data-node-id="3439:28490">
                      Why for Dija’s Skin
                    </p>
                    <p className="tp-23" data-node-id="3439:28491">
                      UV deepens PIH on MST 8 skin — SPF is the treatment protector, not an extra.
                      <br aria-hidden />
                      {`Gel base: creams clog on high-sebum profiles. Look for "no white cast" formulas.`}
                    </p>
                  </div>
                </div>
                <div className="tp-20" data-node-id="3439:28492">
                  <div className="tp-24" data-node-id="3439:28493">
                    <p className="tp-25" data-node-id="3439:28494">
                      Instructions
                    </p>
                    <p className="tp-26" data-node-id="3439:28495">{`Use mornings. Two fingers' length across face and neck. Reapply at midday if outdoors.`}</p>
                  </div>
                </div>
              </div>
              <div className="tp-27" data-node-id="3439:28496">
                <p className="tp-28" data-node-id="3439:28497">
                  Recommended Products for Skin Type
                </p>
                <div className="tp-29" data-node-id="3439:28498">
                  <div className="tp-30" data-node-id="3439:28499">
                    <div className="tp-31" data-node-id="3439:28500">
                      <p className="tp-32" data-node-id="I3439:28500;306:6732">
                        Black Girl Sunscreen
                      </p>
                    </div>
                    <div className="tp-31" data-node-id="3439:28501">
                      <p className="tp-32" data-node-id="I3439:28501;306:6732">
                        Beauty of Joseon
                      </p>
                    </div>
                    <div className="tp-31" data-node-id="3439:28502">
                      <p className="tp-32" data-node-id="I3439:28502;306:6732">{` Estilin Sunscreen`}</p>
                    </div>
                  </div>
                  <div className="tp-33" data-node-id="3439:28503">
                    <div className="tp-34" data-node-id="3439:28504">
                      <p className="tp-32" data-node-id="I3439:28504;306:6732">
                        Nivea hydrating sunscreen
                      </p>
                    </div>
                    <div className="tp-35" data-node-id="3439:28505">
                      <p className="tp-32" data-node-id="I3439:28505;306:6732">
                        +3 in Lagos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="tp-36" data-node-id="3439:28506">
              <div className="tp-37">
                <img alt="" className="tp-38" src={imgLine76} />
              </div>
            </div>
            <div className="tp-39" data-node-id="3439:28507">
              <div className="tp-10" data-node-id="3439:28508">
                <div className="tp-11" data-node-id="3439:28509">
                  <p className="tp-12" data-node-id="3439:28510">
                    Gentle Foaming Cleanser (Salicylic Acid 0.5%)
                  </p>
                  <p className="tp-13" data-node-id="3439:28511">{`Targets: Excess sebum & Clogged pores`}</p>
                </div>
                <div className="tp-14" data-node-id="3439:28512">
                  <div className="tp-40" data-node-id="3439:28513">
                    <p className="tp-41" data-node-id="I3439:28513;306:6719">
                      Alt.Nights
                    </p>
                  </div>
                  <div className="tp-17" data-node-id="3439:28514">
                    <p className="tp-18" data-node-id="I3439:28514;306:6719">
                      Non-negotiable
                    </p>
                  </div>
                  <div className="tp-6" data-node-id="3439:28515" data-name="angle-small-down 1">
                    <img alt="" className="tp-5" src={imgAngleSmallDown1} />
                  </div>
                </div>
              </div>
            </div>
            <div className="tp-36" data-node-id="3439:28516">
              <div className="tp-37">
                <img alt="" className="tp-38" src={imgFrame471} />
              </div>
            </div>
            <div className="tp-39" data-node-id="3439:28518">
              <div className="tp-10" data-node-id="3439:28519">
                <div className="tp-11" data-node-id="3439:28520">
                  <p className="tp-12" data-node-id="3439:28521">
                    Adapalene 0.1% gel
                  </p>
                  <p className="tp-13" data-node-id="3439:28522">
                    Targets: acne and the PIH
                  </p>
                </div>
                <div className="tp-14" data-node-id="3439:28523">
                  <div className="tp-42" data-node-id="3439:28524">
                    <p className="tp-43" data-node-id="I3439:28524;306:6719">
                      Evenings
                    </p>
                  </div>
                  <div className="tp-17" data-node-id="3439:28525">
                    <p className="tp-18" data-node-id="I3439:28525;306:6719">
                      Non-negotiable
                    </p>
                  </div>
                  <div className="tp-6" data-node-id="3439:28526" data-name="angle-small-down 1">
                    <img alt="" className="tp-5" src={imgAngleSmallDown1} />
                  </div>
                </div>
              </div>
            </div>
            <div className="tp-36" data-node-id="3439:28527">
              <div className="tp-37">
                <img alt="" className="tp-38" src={imgFrame474} />
              </div>
            </div>
            <div className="tp-39" data-node-id="3439:28529">
              <div className="tp-10" data-node-id="3439:28530">
                <div className="tp-11" data-node-id="3439:28531">
                  <p className="tp-12" data-node-id="3439:28532">
                    Oil-free gel moisturiser, niacinamide 5%
                  </p>
                  <p className="tp-13" data-node-id="3439:28533">
                    Targets: Dry skin and dark marks
                  </p>
                </div>
                <div className="tp-14" data-node-id="3439:28534">
                  <div className="tp-44" data-node-id="3439:28535">
                    <p className="tp-45" data-node-id="I3439:28535;306:6719">{`Every Mon & Eve`}</p>
                  </div>
                  <div className="tp-15" data-node-id="3439:28536">
                    <p className="tp-46" data-node-id="I3439:28536;306:6719">
                      Optional
                    </p>
                  </div>
                  <div className="tp-6" data-node-id="3439:28537" data-name="angle-small-down 1">
                    <img alt="" className="tp-5" src={imgAngleSmallDown1} />
                  </div>
                </div>
              </div>
            </div>
            <div className="tp-36" data-node-id="3439:28538" />
          </div>
          <div className="tp-2" data-node-id="3439:28539">
            <div className="tp-47" data-node-id="3439:28540" />
            <div className="tp-48" data-node-id="3439:28541" />
            <div className="tp-48" data-node-id="3439:28542" />
          </div>
        </div>
      )}
      {isFrame759 && (
        <>
          <div className="tp-49" data-node-id="3439:28551" data-name="Component 52">
            <div className="tp-50" data-node-id="I3439:28551;858:10786">
              <div className="tp-19" data-node-id="I3439:28551;858:10787">
                <div className="tp-51" data-node-id="I3439:28551;858:10788">
                  <p className="tp-12" data-node-id="I3439:28551;858:10789">{`Clindamycin 1% + Benzoyl Peroxide 5% Gel `}</p>
                  <p className="tp-52" data-node-id="I3439:28551;858:10790">
                    For Acne Vulgaris · 2× daily
                  </p>
                </div>
                <div className="tp-53" data-node-id="I3439:28551;858:10791">
                  <div className="tp-42" data-node-id="I3439:28551;858:10792">
                    <p className="tp-54" data-node-id="I3439:28551;858:10792;251:3911">
                      Active
                    </p>
                  </div>
                  <div className="tp-6" data-node-id="I3439:28551;858:10793" data-name="angle-small-down 1">
                    <img alt="" className="tp-5" src={imgAngleSmallDown2} />
                  </div>
                </div>
              </div>
              <div className="tp-55" data-node-id="I3439:28551;858:10794">
                <div className="tp-56" data-node-id="I3439:28551;858:10795">
                  <p className="tp-57" data-node-id="I3439:28551;858:10796">
                    Instructions
                  </p>
                  <p className="tp-58" data-node-id="I3439:28551;858:10797">{`For bacterial overgrowth Apply twice (Morning & Night) daily to affected areas. Avoid eye area. Use with moisturizer to prevent dryness`}</p>
                </div>
              </div>
              <div className="tp-59" data-node-id="I3439:28551;858:10798">
                <div className="tp-60" data-node-id="I3439:28551;858:10799">
                  <p className="tp-52" data-node-id="I3439:28551;858:10800">
                    Performance
                  </p>
                  <p className="tp-61" data-node-id="I3439:28551;858:10801">
                    92%
                  </p>
                </div>
                <div className="tp-60" data-node-id="I3439:28551;858:10802">
                  <p className="tp-52" data-node-id="I3439:28551;858:10803">
                    Adherence
                  </p>
                  <p className="tp-12" data-node-id="I3439:28551;858:10804">
                    92%
                  </p>
                </div>
                <div className="tp-60" data-node-id="I3439:28551;858:10805">
                  <p className="tp-52" data-node-id="I3439:28551;858:10806">
                    Refill
                  </p>
                  <p className="tp-62" data-node-id="I3439:28551;858:10807">
                    8 days
                  </p>
                </div>
              </div>
              <div className="tp-63" data-node-id="I3439:28551;858:10808">
                <div className="tp-64" data-node-id="I3439:28551;858:10809">
                  <p className="tp-65">{`Recommended Brands: `}</p>
                  <p className="tp-66">
                    <span className="tp-67">{`Duac · BenzaClin · Acanya · `}</span>
                    <span className="tp-68">availability in Lagos ›</span>
                  </p>
                </div>
                <div className="tp-69" data-node-id="I3439:28551;858:10810">
                  <div className="tp-70" data-node-id="I3439:28551;858:10811">
                    <div className="tp-71" data-node-id="I3439:28551;858:10812" data-name="clock-five 1">
                      <img alt="" className="tp-5" src={imgClockFive1} />
                    </div>
                    <p className="tp-72" data-node-id="I3439:28551;858:10813">
                      Started 12 Jan · week 10 of 12
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="tp-10" data-node-id="I3439:28551;858:10814">
              <div className="tp-73" data-node-id="I3439:28551;858:10815">
                <p className="tp-74" data-node-id="I3439:28551;858:10815;496:5929">
                  Renew
                </p>
              </div>
              <div className="tp-75" data-node-id="I3439:28551;858:10816">
                <p className="tp-76" data-node-id="I3439:28551;858:10816;496:5929">
                  Adjust dose
                </p>
              </div>
              <div className="tp-75" data-node-id="I3439:28551;858:10817">
                <p className="tp-76" data-node-id="I3439:28551;858:10817;496:5929">
                  Discontinue
                </p>
              </div>
            </div>
          </div>
          <div className="tp-77" data-node-id="3439:28552" data-name="Component 53">
            <div className="tp-78" data-node-id="I3439:28552;858:10819">
              <div className="tp-19" data-node-id="I3439:28552;858:10820">
                <div className="tp-51" data-node-id="I3439:28552;858:10821">
                  <p className="tp-12" data-node-id="I3439:28552;858:10822">
                    Tranexamic acid 5% serum
                  </p>
                  <p className="tp-52" data-node-id="I3439:28552;858:10823">
                    Post-inflammatory hyperpigmentation · Nightly
                  </p>
                </div>
                <div className="tp-53" data-node-id="I3439:28552;858:10824">
                  <div className="tp-42" data-node-id="I3439:28552;858:10825">
                    <p className="tp-54" data-node-id="I3439:28552;858:10825;251:3911">
                      Active
                    </p>
                  </div>
                  <div className="tp-79" data-node-id="I3439:28552;858:10826">
                    <div className="tp-80">
                      <div className="tp-81" data-name="angle-small-down 1">
                        <img alt="" className="tp-5" src={imgAngleSmallDown3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tp-77" data-node-id="3439:28553" data-name="Component 54">
            <div className="tp-78" data-node-id="I3439:28553;858:10839">
              <div className="tp-19" data-node-id="I3439:28553;858:10840">
                <div className="tp-51" data-node-id="I3439:28553;858:10841">
                  <p className="tp-12" data-node-id="I3439:28553;858:10842">
                    Ketoconazole 2% shampoo
                  </p>
                  <p className="tp-52" data-node-id="I3439:28553;858:10843">
                    Seborrheic dermatitis · Twice weekly
                  </p>
                </div>
                <div className="tp-53" data-node-id="I3439:28553;858:10844">
                  <div className="tp-44" data-node-id="I3439:28553;858:10845">
                    <p className="tp-82" data-node-id="I3439:28553;858:10845;251:3913">
                      AI suggested
                    </p>
                  </div>
                  <div className="tp-79" data-node-id="I3439:28553;858:10846">
                    <div className="tp-80">
                      <div className="tp-81" data-name="angle-small-down 1">
                        <img alt="" className="tp-5" src={imgAngleSmallDown3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="tp-77" data-node-id="3439:28554" data-name="Component 55">
            <div className="tp-78" data-node-id="I3439:28554;858:10854">
              <div className="tp-19" data-node-id="I3439:28554;858:10855">
                <div className="tp-51" data-node-id="I3439:28554;858:10856">
                  <p className="tp-12" data-node-id="I3439:28554;858:10857">
                    Doxycycline 100mg
                  </p>
                  <p className="tp-52" data-node-id="I3439:28554;858:10858">
                    Acne vulgaris · Once daily
                  </p>
                </div>
                <div className="tp-53" data-node-id="I3439:28554;858:10859">
                  <div className="tp-17" data-node-id="I3439:28554;858:10860">
                    <p className="tp-83" data-node-id="I3439:28554;858:10860;251:3899">
                      Discontinued
                    </p>
                  </div>
                  <div className="tp-79" data-node-id="I3439:28554;858:10861">
                    <div className="tp-80">
                      <div className="tp-81" data-name="angle-small-down 1">
                        <img alt="" className="tp-5" src={imgAngleSmallDown3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
